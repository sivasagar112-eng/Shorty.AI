import React, { useState } from 'react';
import {
  X,
  CloudDownload,
  FolderOpen,
  Terminal,
  Check,
  Copy,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Film,
  Clock,
  Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { getDownloadUrl, openDownloadsFolder, checkServerStatus } from '../services/apiService';

export default function DownloadModal({ clip, videoId, projectTitle, onClose }) {
  const { serverStatus } = useProject();
  const [quality, setQuality] = useState('1080');
  const [aspectRatio, setAspectRatio] = useState(clip?.aspectRatio || '9:16');
  const [fitMode, setFitMode] = useState('crop'); // 'crop' | 'blur'
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [downloadStage, setDownloadStage] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [checkingServer, setCheckingServer] = useState(false);

  if (!clip) return null;

  const downloadUrl = getDownloadUrl({
    videoId: videoId || 'clip',
    startSec: clip.startSec,
    endSec: clip.endSec,
    title: clip.title || projectTitle || 'Shorty_Clip',
    quality,
    aspectRatio,
    fitMode,
  });

  const cliCommand = `yt-dlp --download-sections "*${clip.start}-${clip.end}" -f "bestvideo[height<=1080]+bestaudio/best" "https://www.youtube.com/watch?v=${videoId}"`;

  const handleDirectDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    setDownloadError('');
    setDownloadStage('Connecting to local clipper engine...');

    const timer = setTimeout(() => {
      setDownloadStage(`Extracting and reframing to ${aspectRatio} in ${quality}p HD (usually 15-30s)...`);
    }, 2500);

    try {
      const response = await fetch(downloadUrl);
      clearTimeout(timer);

      if (!response.ok) {
        let errDetails = `Server returned status ${response.status}`;
        try {
          const errJson = await response.json();
          errDetails = errJson.details || errJson.error || errDetails;
        } catch {}
        throw new Error(errDetails);
      }

      setDownloadStage('Saving MP4 to your computer...');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanName = (clip.title || projectTitle || 'Shorty_Clip').replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
      const cleanAspect = (aspectRatio || '9:16').replace(':', 'x');
      a.download = `${cleanName}_${clip.startSec}s_to_${clip.endSec}s_${quality}p_${cleanAspect}_${fitMode}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setDownloadStage('Saved successfully to Downloads folder!');
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError(err.message || 'Download failed. Please ensure the local server is running and try selecting 720p.');
    } finally {
      setIsDownloading(false);
      clearTimeout(timer);
    }
  };

  const handleCopyCmd = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openDownloadsFolder();
    } catch {
      alert('Your clips are saved in your Downloads folder and Shorty.AI/downloads');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-brand-card border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <CloudDownload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white truncate max-w-md">
                Download "{clip.title}"
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                <span className="flex items-center gap-1 font-mono text-cyan-400">
                  <Clock className="w-3 h-3" />
                  {clip.start} → {clip.end} ({clip.durationSec}s)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-purple-400">
                  <Zap className="w-3 h-3" />
                  {clip.score} Viral Score
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Player Preview */}
          {videoId && (
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?start=${clip.startSec}&end=${clip.endSec}&autoplay=1&rel=0`}
                title="Clip Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Quality & Settings Bar */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-gray-300">Resolution:</span>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-black/50 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
              >
                <option value="1080">1080p Full HD (1080x1920)</option>
                <option value="720">720p HD (720x1280)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-300">Aspect Ratio:</span>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="bg-black/50 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
              >
                <option value="9:16">9:16 Vertical (Shorts/Reels)</option>
                <option value="1:1">1:1 Square (Instagram)</option>
                <option value="4:5">4:5 Portrait (Feeds)</option>
                <option value="16:9">16:9 Landscape (Full)</option>
              </select>
            </div>

            {aspectRatio !== '16:9' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-300">Framing:</span>
                <select
                  value={fitMode}
                  onChange={(e) => setFitMode(e.target.value)}
                  className="bg-black/50 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
                >
                  <option value="crop">Fill Vertical (Center Crop)</option>
                  <option value="blur">Blurred Background (Fit)</option>
                </select>
              </div>
            )}
          </div>

          {/* Direct Download Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-indigo-950/30 border border-cyan-500/30 flex flex-col space-y-4 shadow-lg shadow-cyan-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-bold text-white">Save MP4 Directly to PC</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      serverStatus.online
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {serverStatus.online ? 'Local Server Ready' : 'Server Offline'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Clips ONLY this {clip.durationSec}s timeline with zero third-party cutter websites.
                </p>
              </div>

              <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                <button
                  onClick={handleDirectDownload}
                  disabled={isDownloading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-btn text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved to Computer!</span>
                    </>
                  ) : isDownloading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Clipping Video...</span>
                    </>
                  ) : (
                    <>
                      <CloudDownload className="w-4 h-4" />
                      <span>Download {quality}p MP4</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenFolder}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>Open downloaded clips folder</span>
                </button>
              </div>
            </div>

            {/* Live progress stage indicator */}
            {isDownloading && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center space-x-3 text-xs text-cyan-300 animate-fadeIn">
                <RotateCcw className="w-4 h-4 animate-spin flex-shrink-0 text-cyan-400" />
                <span className="font-medium">{downloadStage}</span>
              </div>
            )}

            {/* Error display */}
            {downloadError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-red-300 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Download Failed</p>
                  <p className="text-red-400/90 text-[11px] font-mono break-all">{downloadError}</p>
                  <p className="text-[10px] text-gray-400">
                    Tip: Switch resolution to 720p or use the yt-dlp command below if YouTube blocks video downloads.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Server Offline Instructions Box (if offline) */}
          {!serverStatus.online && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-gray-300">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Companion Server Needed for High-Speed Direct Clipping</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                To download clipped MP4 files directly using local FFmpeg without external websites, start your local Python server:
              </p>
              <div className="p-2.5 rounded-xl bg-black/60 font-mono text-[11px] text-cyan-300 border border-white/10 flex items-center justify-between">
                <code>python server.py</code>
                <span className="text-gray-500 text-[10px]">or double click start.bat</span>
              </div>
            </div>
          )}

          {/* CLI yt-dlp Command Card for Power Users */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-pink-400" />
                <h5 className="text-xs font-bold text-white">Manual Terminal Command (yt-dlp)</h5>
              </div>
              <span className="text-[10px] text-gray-500">Power user option</span>
            </div>

            <div className="flex items-center space-x-2 bg-black/60 p-2 rounded-xl border border-white/10">
              <input
                type="text"
                readOnly
                value={cliCommand}
                className="w-full bg-transparent text-xs text-cyan-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyCmd}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-semibold flex items-center space-x-1 transition-colors flex-shrink-0"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

