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
import subprocess
from flask import Flask, request, jsonify, send_file, send_from_directory

app = Flask(__name__, static_folder=".")
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
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
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(BASE_DIR, path)

@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "yt_dlp": check_yt_dlp(),
        "ffmpeg": bool(FFMPEG_PATH),
        "ffmpeg_path": FFMPEG_PATH,
        "message": "Shorty.AI Companion Server is active and ready"
    })

@app.route("/api/download")
def download_clip():
    video_id = request.args.get("videoId")
    start = request.args.get("start", "0")
    end = request.args.get("end", "30")
    title = request.args.get("title", f"clip_{video_id}")

    if not video_id:
        return jsonify({"error": "Missing videoId parameter"}), 400

    try:
        start_sec = float(start)
        end_sec = float(end)
    except ValueError:
        start_sec, end_sec = 0.0, 30.0

    clean_title = re.sub(r'[^a-zA-Z0-9_\- ]', '', title)[:45].strip() or f"clip_{video_id}"
    output_filename = f"{clean_title}_{int(start_sec)}s_to_{int(end_sec)}s.mp4"
    output_path = os.path.join(DOWNLOADS_DIR, output_filename)

    # Return cached clip if already clipped
    if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
        return send_file(
            output_path,
            as_attachment=True,
            download_name=output_filename,
            mimetype="video/mp4"
        )

    yt_url = f"https://www.youtube.com/watch?v={video_id}"

    # Clip using yt-dlp python module
    try:
        import yt_dlp
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'download_ranges': yt_dlp.utils.download_range_func(None, [(start_sec, end_sec)]),
            'force_keyframes_at_cuts': True,
            'outtmpl': os.path.join(DOWNLOADS_DIR, f"{clean_title}_{int(start_sec)}s_to_{int(end_sec)}s.%(ext)s"),
            'quiet': False,
            'no_warnings': True,
        }
        if FFMPEG_PATH:
            ydl_opts['ffmpeg_location'] = os.path.dirname(FFMPEG_PATH)

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([yt_url])

        if os.path.exists(output_path):
            return send_file(
                output_path,
                as_attachment=True,
                download_name=output_filename,
                mimetype="video/mp4"
            )
    except Exception as e:
        print(f"yt_dlp download error: {e}")

    # Fallback to CLI command
    try:
        cmd = [
            sys.executable, "-m", "yt_dlp",
            "--download-sections", f"*{start_sec}-{end_sec}",
            "--force-keyframes-at-cuts",
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "-o", output_path,
            yt_url
        ]
        if FFMPEG_PATH:
            cmd.extend(["--ffmpeg-location", os.path.dirname(FFMPEG_PATH)])

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)
        if result.returncode == 0 and os.path.exists(output_path):
            return send_file(
                output_path,
                as_attachment=True,
                download_name=output_filename,
                mimetype="video/mp4"
            )
        else:
            err = result.stderr or result.stdout or "Error clipping video"
            return jsonify({"error": "Clipping failed", "details": err}), 500
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
