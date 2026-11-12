# ⚡ Shorty.AI — Turn Long YouTube Videos into Viral Gold

Shorty.AI is an AI-powered web tool that analyzes long YouTube videos, identifies peak high-retention viral moments, and lets you **clip and download those exact timeline video segments directly to your computer as MP4 files**.

---

## ✨ Features

- 🎯 **Viral Moment Detection**: Analyzes video transcripts and scores 30-second segments using engagement density, emotional triggers, and hook patterns.
- 🎬 **Direct Local Video Clipping**: Clips only the exact detected start-to-end timeline and saves the `.mp4` file directly to your local computer (no external cutter websites required).
- 🧠 **Pacing Simulation Fallback**: If subtitles are not available on a video, uses an intelligent audience retention model (opening hooks, midpoint twists, climaxes) to identify viral zones.
- 📺 **Interactive Preview Player**: Preview the exact clip slice with restricted start/end boundaries inside the web app before downloading.
- 🎨 **Modern Dark Glassmorphic UI**: High-end neon gradients, scanner animations, and responsive layout for mobile and desktop.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.10+**
- **Git**
- **FFmpeg** (for video clipping and trimming)

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/<your-username>/Shorty.git
cd Shorty
pip install -r requirements.txt
```

### 3. Launch Shorty.AI
You can start the application with a single command:
```bash
python Shorty.AI/server.py
```
Or simply double-click **`start.bat`** on Windows.

Then open your browser at:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Glassmorphism, animations), Modern JavaScript (ES6+)
- **Backend**: Python 3, Flask, CORS support
- **Video Processing Engine**: `yt-dlp`, `ffmpeg`

---

## 📁 Project Structure

```
Shorty/
├── Shorty.AI/
│   ├── css/
│   │   └── style.css       # Glassmorphism styling and responsive layout
│   ├── js/
│   │   └── app.js          # Transcript parser, NLP scoring, and download controller
│   ├── index.html          # Main application interface
│   └── server.py           # Flask backend for direct MP4 clipping & file streaming
├── .gitignore
├── requirements.txt        # Python dependencies
├── start.bat               # 1-Click Windows desktop launcher
└── README.md
```

---

## 👤 Author
Developed by **Siva Sagar**

