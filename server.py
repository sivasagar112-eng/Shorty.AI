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

@app.route("/api/download")
def download_clip():
    video_id = request.args.get("videoId")
    start = request.args.get("start", "0")
    end = request.args.get("end", "30")
    title = request.args.get("title", f"clip_{video_id}")
    quality = request.args.get("quality", "1080").lower()

    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    try:
        start_sec = float(start)
        end_sec = float(end)
    except ValueError:
        start_sec, end_sec = 0.0, 30.0

    # Format selector tailored for high quality (720p to 1080p)
    if quality in ["720", "720p"]:
        format_selector = (
            "bestvideo[height<=720][height>=480]+bestaudio/"
            "bestvideo[height<=720]+bestaudio/"
            "best[height<=720]/best"
        )
        tag = "720p"
    else:  # Default to 1080p / high resolution
        format_selector = (
            "bestvideo[height<=1080][height>=720]+bestaudio/"
            "bestvideo[height<=1080]+bestaudio/"
            "bestvideo+bestaudio/"
            "best[height>=720]/best"
        )
        tag = "1080p"

    clean_title = re.sub(r'[^a-zA-Z0-9_\- ]', '', title)[:40].strip() or f"clip_{video_id}"
    output_filename = f"{clean_title}_{int(start_sec)}s_to_{int(end_sec)}s_{tag}.mp4"
    output_path = os.path.join(DOWNLOADS_DIR, output_filename)

    # Return cached clip if already clipped at this quality
    if os.path.exists(output_path) and os.path.getsize(output_path) > 10000:
        return send_file(
            output_path,
            as_attachment=True,
            download_name=output_filename,
            mimetype="video/mp4"
        )

    yt_url = f"https://www.youtube.com/watch?v={video_id}"

    # Clip using yt-dlp with High Definition (720p-1080p) + FFmpeg remuxing
    try:
        import yt_dlp
        ydl_opts = {
            'format': format_selector,
            'merge_output_format': 'mp4',
            'download_ranges': yt_dlp.utils.download_range_func(None, [(start_sec, end_sec)]),
            'force_keyframes_at_cuts': True,
            'outtmpl': os.path.join(DOWNLOADS_DIR, f"{clean_title}_{int(start_sec)}s_to_{int(end_sec)}s_{tag}.%(ext)s"),
            'quiet': False,
            'no_warnings': False,
            'source_address': '0.0.0.0',  # Force IPv4 to prevent SSL handshake drops on Windows
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

        if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
            return send_file(
                output_path,
                as_attachment=True,
                download_name=output_filename,
                mimetype="video/mp4"
            )
    except Exception as e:
        print(f"yt_dlp Python module error: {e}")

    # Fallback to CLI command with explicit 720p/1080p format selection
    try:
        cmd = [
            sys.executable, "-m", "yt_dlp",
            "--force-ipv4",
            "--no-check-certificates",
            "--extractor-args", "youtube:player_client=web_creator,web,tv,ios,android",
            "--download-sections", f"*{start_sec}-{end_sec}",
            "--force-keyframes-at-cuts",
            "--merge-output-format", "mp4",
            "-f", format_selector,
            "-o", output_path,
            yt_url
        ]
        if FFMPEG_PATH:
            cmd.extend(["--ffmpeg-location", os.path.dirname(FFMPEG_PATH)])

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=140)
        if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
            return send_file(
                output_path,
                as_attachment=True,
                download_name=output_filename,
                mimetype="video/mp4"
            )
        else:
            err = result.stderr or result.stdout or "Error clipping video"
            return jsonify({
                "error": "Clipping failed",
                "details": err,
                "suggestion": "Video format could not be clipped. Try selecting 720p or Best."
            }), 500
    except Exception as ex:
        return jsonify({"error": "Download processing failed", "details": str(ex)}), 500

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Shorty.AI Local Companion Server")
    print(f"👉 Running at: http://localhost:5000")
    print(f"🎬 FFmpeg Engine: {FFMPEG_PATH or 'Not found'}")
    print("💡 Direct MP4 download endpoint: http://localhost:5000/api/download")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)
