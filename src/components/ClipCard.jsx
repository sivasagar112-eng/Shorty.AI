import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Clock,
  Play,
  SlidersHorizontal,
  CloudDownload,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export default function ClipCard({ clip, onDownload, onDelete, videoId }) {
  const navigate = useNavigate();
  const { setActiveClip } = useProject();

  const handleEdit = () => {
    setActiveClip(clip);
    navigate('/editor');
  };

  const getScoreColor = (score) => {
    if (score >= 93) return 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/40 text-emerald-300';
    if (score >= 85) return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300';
    return 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300';
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col group">
      {/* Top Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 bg-gradient-to-r ${getScoreColor(clip.score)}`}>
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{clip.score} Viral Score</span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{clip.start} → {clip.end}</span>
          <span className="text-[10px] text-gray-500">({clip.durationSec}s)</span>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative aspect-[9/10] bg-black/60 overflow-hidden group/video flex items-center justify-center">
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?start=${clip.startSec}&end=${clip.endSec}&controls=1&rel=0&modestbranding=1`}
            title={clip.title}
            className="w-full h-full object-cover pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-brand-card to-black">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
              <Play className="w-5 h-5 fill-cyan-400 ml-0.5" />
            </div>
            <p className="text-xs font-semibold text-white">{clip.title}</p>
            <p className="text-[10px] text-gray-400 mt-1">{clip.aspectRatio || '9:16'} Vertical Format</p>
          </div>
        )}

        {/* Aspect ratio watermark tag */}
        <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-gray-300 border border-white/10 pointer-events-none">
          {clip.aspectRatio || '9:16'}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {clip.keywords?.map((k, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
              >
                #{k}
              </span>
            ))}
          </div>

          {/* Title */}
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
            {clip.title}
          </h4>

          {/* Transcript Quote */}
          {clip.preview && (
            <p className="text-xs text-gray-300 italic line-clamp-2 border-l-2 border-cyan-500/40 pl-2.5 py-0.5 mb-2 bg-white/[0.02] rounded-r">
              "{clip.preview}"
            </p>
          )}

          {/* AI Reason */}
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
            {clip.reason}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          {/* Left Actions */}
          <div className="flex items-center space-x-1.5">
            {videoId && (
              <a
                href={`https://youtu.be/${videoId}?t=${clip.startSec}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Watch on YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 text-xs font-semibold border border-white/10 transition-colors"
              title="Edit in Video Editor"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {/* Right Actions: Direct Download & Delete */}
          <div className="flex items-center space-x-1.5">
            {onDelete && (
              <button
                onClick={() => onDelete(clip.id)}
                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                title="Delete Clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onDownload(clip)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl gradient-btn text-white text-xs font-bold shadow-sm shadow-cyan-500/30"
              title="Download MP4 to PC"
            >
              <CloudDownload className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

