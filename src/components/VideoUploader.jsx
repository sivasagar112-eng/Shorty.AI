import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Youtube,
  UploadCloud,
  Sparkles,
  Sliders,
  Film,
  FileVideo,
  Clock,
  Layers,
  HelpCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { validateYouTubeUrl } from '../utils/nlpEngine';
import ProgressBar from './ProgressBar';

export default function VideoUploader({ onCompleted }) {
  const navigate = useNavigate();
  const {
    createProjectFromYouTube,
    createProjectFromFile,
    isAnalyzing,
    analysisStep,
  } = useProject();

  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'upload'
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Settings
  const [promptType, setPromptType] = useState('general');
  const [customPrompt, setCustomPrompt] = useState('');
  const [clipCount, setClipCount] = useState(5);
  const [duration, setDuration] = useState('30-60');
  const [aspectRatio, setAspectRatio] = useState('9:16');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|mkv)$/i)) {
      setError('Please upload a supported video format (MP4, MOV, WebM).');
      return;
    }
    setError('');
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const options = {
      promptType,
      customPrompt,
      clipCount: Number(clipCount),
      duration,
      aspectRatio,
    };

    try {
      if (activeTab === 'url') {
        if (!url.trim()) {
          setError('Please paste a YouTube link');
          return;
        }
        if (!validateYouTubeUrl(url)) {
          setError('Invalid YouTube URL. Please enter a valid watch or short URL.');
          return;
        }
        const proj = await createProjectFromYouTube(url, options);
        if (onCompleted) onCompleted(proj);
        else navigate('/clips');
      } else {
        if (!selectedFile) {
          setError('Please select or drag a video file to upload.');
          return;
        }
        const proj = await createProjectFromFile(selectedFile, options);
        if (onCompleted) onCompleted(proj);
        else navigate('/clips');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze video. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Tab Switcher */}
        <div className="flex items-center justify-center p-1.5 bg-black/40 border border-white/10 rounded-2xl max-w-sm mx-auto mb-8">
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setError(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-400 fill-red-400" />
            <span>YouTube URL</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setError(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'url' ? (
            <div className="space-y-3">
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-red-500">
                  <Youtube className="w-6 h-6 fill-red-500" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=...)"
                  disabled={isAnalyzing}
                  className="w-full pl-14 pr-36 py-4 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-gray-500 text-sm sm:text-base font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="absolute right-2 px-6 py-2.5 rounded-xl gradient-btn text-white text-sm font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-500/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate</span>
                </button>
              </div>

              {/* Sample link hint */}
              <div className="flex items-center justify-between text-xs text-gray-400 px-2">
                <span>Free & fast • Instant virality scoring & 9:16 reframing</span>
                <button
                  type="button"
                  onClick={() => setUrl('https://www.youtube.com/watch?v=sbjTmG6hsnw')}
                  className="text-cyan-400 hover:underline"
                >
                  Try sample video
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-white/15 hover:border-white/30 bg-black/30'
                  }`}
                  onClick={() => document.getElementById('videoFileInput').click()}
                >
                  <input
                    id="videoFileInput"
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Drag and drop your video file here
                  </h4>
                  <p className="text-xs text-gray-400 mb-4">
                    Supports MP4, MOV, WebM up to 500MB
                  </p>
                  <span className="inline-block px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-colors">
                    Browse Files
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-12 rounded-lg bg-black overflow-hidden flex items-center justify-center">
                      <FileVideo className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI processing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      className="px-5 py-2.5 rounded-xl gradient-btn text-white text-sm font-bold flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Process Video</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Settings Accordion Toggle */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showAdvanced ? 'Hide AI Clipping Parameters' : 'Customize AI Clipping Settings (Style, Duration, Aspect Ratio)'}</span>
            </button>

            {/* Advanced Settings Drawer */}
            {showAdvanced && (
              <div className="mt-4 p-5 rounded-2xl bg-black/40 border border-white/10 space-y-5 animate-fadeIn">
                {/* AI Prompt / Moment Focus */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    AI Moment Detection Focus
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'general', label: 'All Viral Moments', desc: 'Highest overall virality' },
                      { id: 'funny', label: 'Funny & Comedy', desc: 'Jokes, humor & punchlines' },
                      { id: 'motivational', label: 'Motivational', desc: 'Mindset & inspiration' },
                      { id: 'educational', label: 'Educational', desc: 'Guides & action points' },
                      { id: 'controversial', label: 'Debate / Bold', desc: 'Opposing viewpoints' },
                      { id: 'stories', label: 'Story & Narrative', desc: 'Climaxes & experiences' },
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPromptType(p.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          promptType === p.id
                            ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm shadow-cyan-500/20'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                        }`}
                      >
                        <p className="text-xs font-bold">{p.label}</p>
                        <p className="text-[10px] text-gray-500">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio, Duration & Count */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Target Aspect Ratio
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      <option value="9:16">9:16 Vertical (TikTok, Shorts, Reels)</option>
                      <option value="1:1">1:1 Square (Instagram, LinkedIn)</option>
                      <option value="16:9">16:9 Landscape (YouTube, Web)</option>
                      <option value="4:5">4:5 Portrait (Facebook, Feeds)</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Clip Duration Target
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      <option value="15-30">15 - 30 seconds (High velocity)</option>
                      <option value="30-60">30 - 60 seconds (Standard)</option>
                      <option value="60-90">60 - 90 seconds (Deep story)</option>
                    </select>
                  </div>

                  {/* Clip Count */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Number of Clips
                    </label>
                    <select
                      value={clipCount}
                      onChange={(e) => setClipCount(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                    >
                      <option value="3">3 Clips (Fastest)</option>
                      <option value="5">5 Clips (Recommended)</option>
                      <option value="7">7 Clips (Comprehensive)</option>
                      <option value="10">10 Clips (Maximum)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Real-time processing progress bar */}
      <ProgressBar currentStep={analysisStep} isAnalyzing={isAnalyzing} />
    </div>
  );
}

