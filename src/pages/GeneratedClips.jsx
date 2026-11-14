import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  Zap,
  ArrowUpDown,
  Download,
  FolderOpen,
  SlidersHorizontal,
  CheckSquare,
  Square,
  ArrowLeft,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ClipCard from '../components/ClipCard';
import DownloadModal from '../components/DownloadModal';
import { useProject } from '../context/ProjectContext';
import { openDownloadsFolder } from '../services/apiService';

export default function GeneratedClips() {
  const navigate = useNavigate();
  const { currentProject, deleteProject } = useProject();

  const [sortBy, setSortBy] = useState('highest_score'); // 'highest_score' | 'lowest_score' | 'duration_desc' | 'duration_asc'
  const [selectedClipIds, setSelectedClipIds] = useState([]);
  const [downloadingClip, setDownloadingClip] = useState(null);

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col text-white">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <Film className="w-16 h-16 text-gray-600" />
            <h2 className="text-xl font-bold text-white">No Active Project Selected</h2>
            <p className="text-sm text-gray-400 max-w-sm">
              Please create a project or pick an existing project from the Dashboard to view its generated shorts.
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

  const clips = [...(currentProject.clips || [])];

  // Sorting
  if (sortBy === 'highest_score') {
    clips.sort((a, b) => b.score - a.score);
  } else if (sortBy === 'lowest_score') {
    clips.sort((a, b) => a.score - b.score);
  } else if (sortBy === 'duration_desc') {
    clips.sort((a, b) => b.durationSec - a.durationSec);
  } else if (sortBy === 'duration_asc') {
    clips.sort((a, b) => a.durationSec - b.durationSec);
  }

  const toggleSelectClip = (id) => {
    setSelectedClipIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedClipIds.length === clips.length) setSelectedClipIds([]);
    else setSelectedClipIds(clips.map((c) => c.id));
  };

  const handleBulkDownload = () => {
    if (selectedClipIds.length === 0) return;
    const firstSelected = clips.find((c) => selectedClipIds.includes(c.id));
    if (firstSelected) setDownloadingClip(firstSelected);
  };

  const handleOpenFolder = async () => {
    try {
      await openDownloadsFolder();
    } catch {
      alert('Clips saved in Downloads and Shorty.AI/downloads');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col text-white">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Back button & Project Info Banner */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 min-w-0">
                <img
                  src={currentProject.thumbnail}
                  alt={currentProject.title}
                  className="w-20 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Active Video Project
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">
                    {currentProject.title}
                  </h2>
                  <div className="flex items-center space-x-3 text-xs text-gray-400 mt-0.5">
                    <span>{clips.length} Viral Moments Identified</span>
                    <span>•</span>
                    <span>Duration: {currentProject.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={handleOpenFolder}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition-all"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Open Clips Folder</span>
                </button>
              </div>
            </div>
          </div>

          {/* Controls Bar: Sort, Multi-select, Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            {/* Sorting */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-gray-300">Sort Clips By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/50 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
              >
                <option value="highest_score">Highest Virality Score 🔥</option>
                <option value="lowest_score">Lowest Virality Score</option>
                <option value="duration_desc">Longest Duration</option>
                <option value="duration_asc">Shortest Duration</option>
              </select>
            </div>

            {/* Selection & Bulk Export */}
            <div className="flex items-center space-x-3">
              <button
                onClick={selectAll}
                className="text-xs text-gray-400 hover:text-white font-medium flex items-center gap-1.5"
              >
                {selectedClipIds.length === clips.length ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>Select All ({clips.length})</span>
              </button>

              {selectedClipIds.length > 0 && (
                <button
                  onClick={handleBulkDownload}
                  className="px-3.5 py-1.5 rounded-lg gradient-btn text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-500/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Selected ({selectedClipIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Clips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                videoId={currentProject.videoId}
                onDownload={(c) => setDownloadingClip(c)}
              />
            ))}
          </div>

          {/* Download Modal */}
          {downloadingClip && (
            <DownloadModal
              clip={downloadingClip}
              videoId={currentProject.videoId}
              projectTitle={currentProject.title}
              onClose={() => setDownloadingClip(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

