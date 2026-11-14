"""
Shorty.AI Local Companion Server
Serves the web application and handles direct MP4 clip downloads using yt-dlp & ffmpeg.

Usage:
    python server.py
Then open http://localhost:5000 in your browser.
"""

import os
import re
import sys
import glob
import shutil
import socket
import subprocess
from flask import Flask, request, jsonify, send_file, send_from_directory

# ---------- DNS Resilience ----------
# Force Python to prefer Google Public DNS (8.8.8.8) when ISP DNS is flaky.
# This patches socket-level resolution to retry with a public resolver
# when the system's default DNS fails.
_orig_getaddrinfo = socket.getaddrinfo

def _resilient_getaddrinfo(host, port, *args, **kwargs):
    """Try default DNS first, fall back to Google DNS on failure."""
    try:
        return _orig_getaddrinfo(host, port, *args, **kwargs)
    except socket.gaierror:
        # ISP DNS failed — temporarily point at Google Public DNS and retry
        import ctypes, ctypes.wintypes
        try:
            # Quick UDP resolve via Google DNS
            import struct
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(5)
            # Build a minimal DNS query for the hostname
            query = _build_dns_query(host)
            s.sendto(query, ('8.8.8.8', 53))
            data, _ = s.recvfrom(1024)
            s.close()
            ip = _parse_dns_response(data)
            if ip:
                # Return a valid getaddrinfo-style result for IPv4
                return [(socket.AF_INET, socket.SOCK_STREAM, 6, '', (ip, port or 0))]
        except Exception:
            pass
        # If our manual fallback also fails, raise the original error
        raise

def _build_dns_query(hostname):
    """Build a minimal DNS A-record query packet."""
    import struct, random
    txn_id = random.randint(0, 65535)
    header = struct.pack('>HHHHHH', txn_id, 0x0100, 1, 0, 0, 0)
    question = b''
    for part in hostname.encode().split(b'.'):
        question += bytes([len(part)]) + part
    question += b'\x00'  # null terminator
    question += struct.pack('>HH', 1, 1)  # Type A, Class IN
    return header + question

def _parse_dns_response(data):
    """Extract the first A-record IP from a DNS response."""
    import struct
    if len(data) < 12:
        return None
    qdcount = struct.unpack('>H', data[4:6])[0]
    ancount = struct.unpack('>H', data[6:8])[0]
    offset = 12
    # Skip questions
    for _ in range(qdcount):
        while offset < len(data) and data[offset] != 0:
            if data[offset] & 0xC0 == 0xC0:
                offset += 2
                break
            offset += data[offset] + 1
        else:
            offset += 1
        offset += 4  # QTYPE + QCLASS
    # Parse answers
    for _ in range(ancount):
        if offset >= len(data):
            break
        # Skip name (may be pointer)
        if data[offset] & 0xC0 == 0xC0:
            offset += 2
        else:
            while offset < len(data) and data[offset] != 0:
                offset += data[offset] + 1
            offset += 1
        if offset + 10 > len(data):
            break
        rtype, rclass, ttl, rdlen = struct.unpack('>HHIH', data[offset:offset+10])
        offset += 10
        if rtype == 1 and rdlen == 4:  # A record
            return socket.inet_ntoa(data[offset:offset+4])
        offset += rdlen
    return None

socket.getaddrinfo = _resilient_getaddrinfo
# ---------- End DNS Resilience ----------

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Serve the React production build (dist/) if it exists; fallback to legacy root
DIST_DIR = os.path.join(BASE_DIR, "dist")
_static_folder = DIST_DIR if os.path.isdir(DIST_DIR) else BASE_DIR
app = Flask(__name__, static_folder=_static_folder)
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

def find_ffmpeg():
    # 1. Check local bundled bin folder
    bundled = os.path.join(BASE_DIR, "bin", "ffmpeg.exe")
    if os.path.exists(bundled):
        return bundled
    # 2. Check WinGet package location
    local_app = os.environ.get("LOCALAPPDATA", "")
    if local_app:
        pattern = os.path.join(local_app, "Microsoft", "WinGet", "Packages", "**", "bin", "ffmpeg.exe")
        matches = glob.glob(pattern, recursive=True)
        if matches and os.path.exists(matches[0]):
            return matches[0]
    # 3. Check system PATH
    system_path = shutil.which("ffmpeg")
    if system_path:
        return system_path
    return None

FFMPEG_PATH = find_ffmpeg()
if FFMPEG_PATH:
    ffmpeg_dir = os.path.dirname(FFMPEG_PATH)
    if ffmpeg_dir not in os.environ["PATH"]:
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ["PATH"]

def check_yt_dlp():
    try:
        import yt_dlp
        return True
    except ImportError:
        return False

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route("/")
def index():
    return send_from_directory(_static_folder, "index.html")

@app.route("/<path:path>")
def static_files(path):
    # Serve static assets from dist/ (or legacy root); fallback to index.html for SPA routing
    full_path = os.path.join(_static_folder, path)
    if os.path.isfile(full_path):
        return send_from_directory(_static_folder, path)
    # SPA fallback — let React Router handle client-side routes
    return send_from_directory(_static_folder, "index.html")

@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "yt_dlp": check_yt_dlp(),
        "ffmpeg": bool(FFMPEG_PATH),
        "ffmpeg_path": FFMPEG_PATH,
        "message": "Shorty.AI Companion Server is active and ready"
    })

@app.route("/api/info")
def video_info():
    """Extract real video metadata and duration using yt-dlp."""
    video_id = request.args.get("videoId")
    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    yt_url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        import yt_dlp
        ydl_opts = {
            'skip_download': True,
            'quiet': True,
            'no_warnings': True,
            'source_address': '0.0.0.0',
            'extract_flat': True,
            'socket_timeout': 15,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(yt_url, download=False)
            duration_sec = info.get("duration") or 0
            mins = int(duration_sec // 60)
            secs = int(duration_sec % 60)
            duration_str = f"{mins}:{secs:02d}"
            return jsonify({
                "title": info.get("title") or "YouTube Video",
                "duration": duration_sec,
                "durationFormatted": duration_str,
                "author": info.get("uploader") or info.get("channel") or "Creator",
                "thumbnail": info.get("thumbnail") or f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            })
    except Exception as e:
        return jsonify({"error": str(e), "duration": 600, "durationFormatted": "10:00"}), 200

@app.route("/api/open-downloads")
def open_downloads_folder():
    """Opens the local server downloads folder in Windows Explorer."""
    try:
        if sys.platform == "win32":
            os.startfile(DOWNLOADS_DIR)
        else:
            subprocess.Popen(["xdg-open", DOWNLOADS_DIR])
        return jsonify({"success": True, "path": DOWNLOADS_DIR})
    except Exception as e:
        return jsonify({"error": str(e), "path": DOWNLOADS_DIR}), 500

def reframe_video(input_path, output_path, aspect_ratio="9:16", quality="1080", fit_mode="crop", ffmpeg_path=None):
    """
    Reframes an input video (16:9) into target aspect ratio (9:16, 1:1, 4:5, 16:9)
    using FFmpeg with high-definition scaling and visually lossless H.264 encoding.
    """
    if not ffmpeg_path:
        ffmpeg_path = find_ffmpeg() or "ffmpeg"

    is_720 = "720" in quality
    if aspect_ratio == "9:16":
        w, h = (720, 1280) if is_720 else (1080, 1920)
    elif aspect_ratio == "1:1":
        w, h = (720, 720) if is_720 else (1080, 1080)
    elif aspect_ratio == "4:5":
        w, h = (720, 900) if is_720 else (1080, 1350)
    else:  # 16:9
        w, h = (1280, 720) if is_720 else (1920, 1080)

    if aspect_ratio == "16:9":
        # Standard landscape, encode cleanly to MP4
        cmd = [
            ffmpeg_path, "-y", "-i", input_path,
            "-vf", f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k",
            output_path
        ]
    elif fit_mode == "blur":
        # Blurred background with original video centered
        filter_complex = (
            f"[0:v]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},boxblur=25:5[bg];"
            f"[0:v]scale={w}:-2[fg];"
            f"[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]"
        )
        cmd = [
            ffmpeg_path, "-y", "-i", input_path,
            "-filter_complex", filter_complex,
            "-map", "[outv]", "-map", "0:a?",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k",
            output_path
        ]
    else:
        # Standard full-bleed center crop for vertical 9:16 (Shorts/Reels)
        vf = f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}"
        cmd = [
            ffmpeg_path, "-y", "-i", input_path,
            "-vf", vf,
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k",
            output_path
        ]

    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180)
    if res.returncode != 0 or not os.path.exists(output_path) or os.path.getsize(output_path) < 1000:
        raise RuntimeError(f"FFmpeg reframing failed: {res.stderr or res.stdout}")
    return output_path

@app.route("/api/download")
def download_clip():
    video_id = request.args.get("videoId")
    start = request.args.get("start", "0")
    end = request.args.get("end", "30")
    title = request.args.get("title", f"clip_{video_id}")
    quality = request.args.get("quality", "1080").lower()
    aspect_ratio = request.args.get("aspectRatio", "9:16")
    fit_mode = request.args.get("fitMode", "crop").lower()

    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    try:
        start_sec = float(start)
        end_sec = float(end)
    except ValueError:
        start_sec, end_sec = 0.0, 30.0

    # Ensure format selector requests high quality (up to 1080p or 720p)
    if "720" in quality:
        format_selector = (
            "bestvideo[height<=720]+bestaudio/"
            "best[height<=720]/best"
        )
        tag = "720p"
    else:  # Default to 1080p
        format_selector = (
            "bestvideo[height>=1080]+bestaudio/"
            "bestvideo[height<=1080]+bestaudio/"
            "bestvideo+bestaudio/"
            "best"
        )
        tag = "1080p"

    clean_aspect = aspect_ratio.replace(":", "x")
    clean_title = re.sub(r'[^a-zA-Z0-9_\- ]', '', title)[:40].strip() or f"clip_{video_id}"
    output_filename = f"{clean_title}_{int(start_sec)}s_to_{int(end_sec)}s_{tag}_{clean_aspect}_{fit_mode}.mp4"
    output_path = os.path.join(DOWNLOADS_DIR, output_filename)

    # Return cached clip if already clipped at this exact quality & aspect ratio
    if os.path.exists(output_path) and os.path.getsize(output_path) > 10000:
        return send_file(
            output_path,
            as_attachment=True,
            download_name=output_filename,
            mimetype="video/mp4"
        )

    yt_url = f"https://www.youtube.com/watch?v={video_id}"
    raw_temp_base = os.path.join(DOWNLOADS_DIR, f"raw_{video_id}_{int(start_sec)}_{int(end_sec)}_{tag}")

    # Step 1: Clip raw segment using yt-dlp
    raw_file = None
    try:
        import yt_dlp
        ydl_opts = {
            'format': format_selector,
            'merge_output_format': 'mp4',
            'download_ranges': yt_dlp.utils.download_range_func(None, [(start_sec, end_sec)]),
            'force_keyframes_at_cuts': True,
            'outtmpl': f"{raw_temp_base}.%(ext)s",
            'quiet': False,
            'no_warnings': False,
            'source_address': '0.0.0.0',
            'nocheckcertificate': True,
            'socket_timeout': 30,
            'retries': 5,
            'fragment_retries': 5,
            'extractor_args': {
                'youtube': {
                    'player_client': ['web_creator', 'web', 'tv', 'ios', 'android']
                }
            },
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        }
        if FFMPEG_PATH:
            ydl_opts['ffmpeg_location'] = os.path.dirname(FFMPEG_PATH)

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([yt_url])

        candidates = glob.glob(f"{raw_temp_base}.*")
        if candidates and os.path.getsize(candidates[0]) > 1000:
            raw_file = candidates[0]
    except Exception as e:
        print(f"yt_dlp module download warning: {e}")

    # Fallback to CLI command if Python module failed
    if not raw_file or not os.path.exists(raw_file):
        try:
            cli_raw = f"{raw_temp_base}.mp4"
            cmd = [
                sys.executable, "-m", "yt_dlp",
                "--force-ipv4",
                "--no-check-certificates",
                "--extractor-args", "youtube:player_client=web_creator,web,tv,ios,android",
                "--download-sections", f"*{start_sec}-{end_sec}",
                "--force-keyframes-at-cuts",
                "--merge-output-format", "mp4",
                "-f", format_selector,
                "-o", cli_raw,
                yt_url
            ]
            if FFMPEG_PATH:
                cmd.extend(["--ffmpeg-location", os.path.dirname(FFMPEG_PATH)])

            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=140)
            if res.returncode == 0 and os.path.exists(cli_raw) and os.path.getsize(cli_raw) > 1000:
                raw_file = cli_raw
        except Exception as ex:
            print(f"yt_dlp CLI fallback warning: {ex}")

    if not raw_file or not os.path.exists(raw_file):
        return jsonify({
            "error": "Clipping failed",
            "details": "Could not download the specified clip from YouTube. Please check network/DNS connection or try 720p."
        }), 500

    # Step 2: Reframe into 9:16 vertical / selected aspect ratio with FFmpeg
    try:
        reframe_video(
            input_path=raw_file,
            output_path=output_path,
            aspect_ratio=aspect_ratio,
            quality=quality,
            fit_mode=fit_mode,
            ffmpeg_path=FFMPEG_PATH
        )
    except Exception as reframe_err:
        print(f"Reframing error: {reframe_err}")
        # If reframing failed, fallback to serving the raw file
        shutil.copy(raw_file, output_path)
    finally:
        # Clean up temporary raw file
        for f in glob.glob(f"{raw_temp_base}.*"):
            try:
                os.remove(f)
            except Exception:
                pass

    if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
        return send_file(
            output_path,
            as_attachment=True,
            download_name=output_filename,
            mimetype="video/mp4"
        )

    return jsonify({"error": "Failed to generate reframed clip"}), 500

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Shorty.AI Local Companion Server")
    print(f"👉 Running at: http://localhost:5000")
    print(f"🎬 FFmpeg Engine: {FFMPEG_PATH or 'Not found'}")
    print("💡 Direct MP4 download endpoint: http://localhost:5000/api/download")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)
