import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Type,
  Layout,
  Palette,
  CloudDownload,
  Scissors,
  Smartphone,
  Monitor,
  SplitSquareVertical,
  Layers,
  Sparkles,
  Check,
  FolderOpen,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DownloadModal from '../components/DownloadModal';
import { useProject } from '../context/ProjectContext';
import { formatTime } from '../utils/nlpEngine';
import { openDownloadsFolder } from '../services/apiService';

export default function Editor() {
  const navigate = useNavigate();
  const { currentProject, activeClip, updateClipInProject } = useProject();

  // If no active clip, pick first clip from current project
  const clip = activeClip || currentProject?.clips?.[0];

  // Editor State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // relative to clip start (0 to duration)
  const [activeTab, setActiveTab] = useState('captions'); // 'captions' | 'reframing' | 'layouts' | 'trimming' | 'branding'

  // Trimming State
  const [startSec, setStartSec] = useState(clip?.startSec || 0);
  const [endSec, setEndSec] = useState(clip?.endSec || 30);
  const durationSec = Math.max(1, endSec - startSec);

  // Aspect Ratio & Layout
  const [aspectRatio, setAspectRatio] = useState(clip?.aspectRatio || '9:16');
  const [layoutMode, setLayoutMode] = useState('single'); // 'single' | 'split' | 'pip' | 'gaming'
  const [backgroundStyle, setBackgroundStyle] = useState('blur'); // 'blur' | 'black' | 'gradient'

  // Caption Styling State
  const [fontFamily, setFontFamily] = useState('Outfit');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [highlightColor, setHighlightColor] = useState('#FACC15'); // Yellow
  const [captionPosition, setCaptionPosition] = useState('bottom'); // 'bottom' | 'center' | 'top'
  const [captionAnimation, setCaptionAnimation] = useState('karaoke'); // 'karaoke' | 'pop' | 'classic'

  // Subtitles content
  const [subtitles, setSubtitles] = useState(
    clip?.subtitles || [
      { id: 1, start: 0, end: 4, text: 'When you eliminate latency' },
      { id: 2, start: 4, end: 8, text: 'between perception and decision,' },
      { id: 3, start: 8, end: 12, text: 'the entire paradigm shifts completely.' },
    ]
  );

  // Branding State
  const [brandLogoText, setBrandLogoText] = useState('Shorty.AI');
  const [showWatermark, setShowWatermark] = useState(true);

  // Download modal state
  const [showExportModal, setShowExportModal] = useState(false);

  // Playback timer simulation
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.2;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationSec]);

  // Find active subtitle line based on currentTime
  const currentSubtitle = subtitles.find(
    (s) => currentTime >= s.start && currentTime <= s.end
  ) || subtitles[0];

  const handleUpdateSubtitleText = (id, newText) => {
    const updated = subtitles.map((s) => (s.id === id ? { ...s, text: newText } : s));
    setSubtitles(updated);
    if (clip) {
      updateClipInProject(clip.id, { subtitles: updated });
    }
  };

  const handleSaveSettings = () => {
    if (clip) {
      updateClipInProject(clip.id, {
        startSec,
        endSec,
        durationSec,
        start: formatTime(startSec),
        end: formatTime(endSec),
        aspectRatio,
        subtitles,
      });
      alert('Changes saved to your project!');
    }
  };

  if (!clip) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col text-white">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <Sliders className="w-16 h-16 text-gray-600" />
            <h2 className="text-xl font-bold text-white">No Clip Selected for Editing</h2>
            <p className="text-sm text-gray-400 max-w-sm">
              Please choose a clip from the Generated Clips tab or create a new project.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold"
            >
              Go to Dashboard
            </button>
          </main>
        </div>
      </div>
    );
  }

  // Compute container aspect ratio class
  const getAspectClass = () => {
    if (aspectRatio === '9:16') return 'aspect-[9/16] max-w-[320px]';
    if (aspectRatio === '1:1') return 'aspect-square max-w-[420px]';
    if (aspectRatio === '4:5') return 'aspect-[4/5] max-w-[360px]';
    return 'aspect-video max-w-[560px]';
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col text-white">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col space-y-6 overflow-y-auto">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/clips')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Back to Clips"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Video Editor</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {aspectRatio}
                  </span>
                </h1>
                <p className="text-xs text-gray-400">{clip.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-5 py-2 rounded-xl gradient-btn text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-500/30"
              >
                <CloudDownload className="w-4 h-4" />
                <span>Export Clip</span>
              </button>
            </div>
          </div>

          {/* Editor Workspace: Preview Left (7 cols), Controls Right (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Center / Left: Interactive Video Canvas Preview */}
            <div className="lg:col-span-7 flex flex-col items-center space-y-4">
              <div className="w-full flex items-center justify-between text-xs text-gray-400 px-2">
                <span>Interactive Live Preview ({aspectRatio})</span>
                <span className="font-mono text-cyan-400">
                  {formatTime(Math.floor(currentTime))} / {formatTime(durationSec)}
                </span>
              </div>

              {/* Dynamic Video Mockup Container */}
              <div
                className={`relative w-full ${getAspectClass()} rounded-3xl overflow-hidden border-2 border-cyan-500/40 bg-black shadow-glow-cyan flex flex-col justify-between transition-all duration-300`}
              >
                {/* Visual Background Layers (Blurred original or fill) */}
                {backgroundStyle === 'blur' ? (
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={currentProject?.thumbnail}
                      alt="Blurred bg"
                      className="w-full h-full object-cover filter blur-xl scale-125 opacity-40"
                    />
                  </div>
                ) : backgroundStyle === 'gradient' ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-black to-cyan-950" />
                ) : (
                  <div className="absolute inset-0 bg-black" />
                )}

                {/* Main Speaker Layer (according to AI layout) */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2">
                  {layoutMode === 'split' ? (
                    <div className="w-full h-full flex flex-col space-y-1">
                      <div className="h-1/2 w-full rounded-xl overflow-hidden border border-white/20">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                          alt="Speaker 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="h-1/2 w-full rounded-xl overflow-hidden border border-white/20">
                        <img
                          src="https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80"
                          alt="Speaker 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : layoutMode === 'pip' ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80"
                        alt="Main view"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 right-4 w-28 h-28 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-xl">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          alt="Facecam"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                        alt="Single speaker"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Brand Logo / Watermark Overlay */}
                  {showWatermark && (
                    <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur border border-white/20 text-[10px] font-bold text-white flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{brandLogoText}</span>
                    </div>
                  )}

                  {/* Synchronized Dynamic Captions Layer */}
                  <div
                    className={`absolute inset-x-4 z-20 text-center transition-all duration-200 ${
                      captionPosition === 'top'
                        ? 'top-8'
                        : captionPosition === 'center'
                        ? 'top-1/2 -translate-y-1/2'
                        : 'bottom-8'
                    }`}
                  >
                    <div className="inline-block px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl max-w-xs">
                      <p
                        style={{
                          fontFamily,
                          fontSize: `${fontSize}px`,
                          color: textColor,
                          lineHeight: 1.25,
                        }}
                        className={`font-black tracking-wide ${
                          captionAnimation === 'pop'
                            ? 'animate-bounce'
                            : captionAnimation === 'karaoke'
                            ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                            : ''
                        }`}
                      >
                        {currentSubtitle ? (
                          <span>
                            {currentSubtitle.text.split(' ').map((word, i) => (
                              <span
                                key={i}
                                style={{
                                  color: i % 2 === 0 ? highlightColor : textColor,
                                }}
                                className="mr-1 inline-block"
                              >
                                {word}
                              </span>
                            ))}
                          </span>
                        ) : (
                          'Ready to publish short'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Video scrubber bar at bottom */}
                <div className="relative z-20 p-3 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-100"
                      style={{ width: `${(currentTime / durationSec) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Player Controls Bar */}
              <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/5 border border-white/10 w-full max-w-md justify-center">
                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center text-white shadow-md shadow-cyan-500/30"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <div className="text-xs font-mono text-gray-300">
                  {formatTime(Math.floor(currentTime))} / {formatTime(durationSec)}
                </div>
              </div>
            </div>

            {/* Right: Editing Tool Controls (5 cols) */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
              {/* Tool Tabs Switcher */}
              <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-2xl overflow-x-auto">
                {[
                  { id: 'captions', label: 'Captions', icon: Type },
                  { id: 'reframing', label: 'Reframing', icon: Smartphone },
                  { id: 'layouts', label: 'Layouts', icon: Layout },
                  { id: 'trimming', label: 'Trimming', icon: Scissors },
                  { id: 'branding', label: 'Branding', icon: Palette },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
                        activeTab === t.id
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Captions */}
              {activeTab === 'captions' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Caption Appearance & Animation
                  </h3>

                  {/* Font Family & Size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Font Family
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full p-2 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Outfit">Outfit (Modern)</option>
                        <option value="Montserrat">Montserrat (Bold)</option>
                        <option value="Impact">Impact (Viral Classic)</option>
                        <option value="Inter">Inter (Clean)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Font Size ({fontSize}px)
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="36"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Base Text Color
                      </label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-9 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Highlight Color
                      </label>
                      <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => setHighlightColor(e.target.value)}
                        className="w-full h-9 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                      Caption Position
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['bottom', 'center', 'top'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setCaptionPosition(pos)}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                            captionPosition === pos
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                              : 'bg-white/5 border-white/5 text-gray-400'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animation Style */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                      Subtitle Animation Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'karaoke', label: 'Karaoke' },
                        { id: 'pop', label: 'Pop Bounce' },
                        { id: 'classic', label: 'Classic' },
                      ].map((anim) => (
                        <button
                          key={anim.id}
                          onClick={() => setCaptionAnimation(anim.id)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            captionAnimation === anim.id
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                              : 'bg-white/5 border-white/5 text-gray-400'
                          }`}
                        >
                          {anim.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitle Cue Text Editor */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <label className="block text-[11px] font-semibold text-gray-300">
                      Edit Subtitle Words
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {subtitles.map((sub) => (
                        <div key={sub.id} className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-cyan-400 w-12 flex-shrink-0">
                            {formatTime(sub.start)}
                          </span>
                          <input
                            type="text"
                            value={sub.text}
                            onChange={(e) => handleUpdateSubtitleText(sub.id, e.target.value)}
                            className="flex-1 p-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Reframing */}
              {activeTab === 'reframing' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Video Aspect Ratio & Canvas Reframing
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: '9:16', label: '9:16 Vertical', sub: 'TikTok, Reels, Shorts' },
                      { id: '1:1', label: '1:1 Square', sub: 'Instagram Feed, LinkedIn' },
                      { id: '4:5', label: '4:5 Portrait', sub: 'Facebook & Instagram' },
                      { id: '16:9', label: '16:9 Landscape', sub: 'YouTube & Web Video' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAspectRatio(item.id)}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          aspectRatio === item.id
                            ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm shadow-cyan-500/20'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <p className="text-xs font-bold">{item.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.sub}</p>
                      </button>
                    ))}
                  </div>

                  {/* Background Style */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                      Canvas Padding Background
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['blur', 'black', 'gradient'].map((b) => (
                        <button
                          key={b}
                          onClick={() => setBackgroundStyle(b)}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                            backgroundStyle === b
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                              : 'bg-white/5 border-white/5 text-gray-400'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Layouts */}
              {activeTab === 'layouts' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    AI Camera & Speaker Layouts
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'single', label: 'Single Speaker Focus', desc: 'Auto face-tracks active speaker' },
                      { id: 'split', label: 'Split Screen Layout', desc: 'Host on top, guest or gameplay bottom' },
                      { id: 'pip', label: 'Picture-in-Picture', desc: 'Facecam overlay in corner' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setLayoutMode(l.id)}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          layoutMode === l.id
                            ? 'bg-purple-500/15 border-purple-500/50 text-white shadow-sm shadow-purple-500/20'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <p className="text-xs font-bold">{l.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{l.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Trimming */}
              {activeTab === 'trimming' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Clip Boundaries & Timeline Trimming
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Start Time ({formatTime(startSec)})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={endSec - 5}
                        value={startSec}
                        onChange={(e) => setStartSec(Math.max(0, Number(e.target.value)))}
                        className="w-full p-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        End Time ({formatTime(endSec)})
                      </label>
                      <input
                        type="number"
                        min={startSec + 5}
                        value={endSec}
                        onChange={(e) => setEndSec(Math.max(startSec + 5, Number(e.target.value)))}
                        className="w-full p-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center justify-between">
                    <span>Clip Duration:</span>
                    <span className="font-bold text-cyan-400">{durationSec} Seconds</span>
                  </div>
                </div>
              )}

              {/* Tab 5: Branding */}
              {activeTab === 'branding' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Custom Watermark & Brand Watermark
                  </h3>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs font-semibold text-gray-300">Show Brand Watermark</span>
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {showWatermark && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Brand Watermark Label
                      </label>
                      <input
                        type="text"
                        value={brandLogoText}
                        onChange={(e) => setBrandLogoText(e.target.value)}
                        placeholder="e.g. @MyChannel or Brand"
                        className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Export Modal */}
          {showExportModal && (
            <DownloadModal
              clip={{
                ...clip,
                startSec,
                endSec,
                durationSec,
                start: formatTime(startSec),
                end: formatTime(endSec),
                aspectRatio,
              }}
              videoId={currentProject?.videoId}
              projectTitle={currentProject?.title}
              onClose={() => setShowExportModal(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

