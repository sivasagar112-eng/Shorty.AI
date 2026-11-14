import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FolderKanban,
  Film,
  Zap,
  Clock,
  TrendingUp,
  FolderOpen,
  Server,
  Play,
  SlidersHorizontal,
  CloudDownload,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VideoUploader from '../components/VideoUploader';
import DownloadModal from '../components/DownloadModal';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { openDownloadsFolder } from '../services/apiService';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    projects,
    currentProject,
    setCurrentProject,
    setActiveClip,
    serverStatus,
    deleteProject,
  } = useProject();
  const { user } = useAuth();

  const [downloadModalClip, setDownloadModalClip] = useState(null);

  const totalClips = projects.reduce((acc, p) => acc + (p.clips?.length || 0), 0);
  const avgScore = totalClips > 0
    ? Math.round(
        projects.flatMap((p) => p.clips || []).reduce((acc, c) => acc + (c.score || 0), 0) /
          totalClips
      )
    : 92;

  const handleOpenFolder = async () => {
    try {
      await openDownloadsFolder();
    } catch {
      alert('Your clips are saved in your Downloads folder and Shorty.AI/downloads');
    }
  };

  const handleOpenProject = (proj) => {
    setCurrentProject(proj);
    navigate('/clips');
  };

  const handleEditClip = (proj, clip) => {
    setCurrentProject(proj);
    setActiveClip(clip);
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col text-white">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Creator'} 👋
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage your video clipping projects and generate high-engagement shorts.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleOpenFolder}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition-all"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open Clips Folder</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>Total Projects</span>
                <FolderKanban className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{projects.length}</p>
              <p className="text-[11px] text-gray-500">Active video workspaces</p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>Generated Clips</span>
                <Film className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{totalClips}</p>
              <p className="text-[11px] text-gray-500">Ready for 9:16 export</p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>Avg Virality Score</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{avgScore} <span className="text-sm font-normal text-gray-400">/ 100</span></p>
              <p className="text-[11px] text-emerald-400 font-medium">Top 5% engagement band</p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                <span>Local Server</span>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <p className={`text-xl font-bold ${serverStatus.online ? 'text-emerald-400' : 'text-amber-400'}`}>
                {serverStatus.online ? 'Connected' : 'Offline'}
              </p>
              <p className="text-[11px] text-gray-500">
                {serverStatus.online ? 'FFmpeg & yt-dlp active' : 'Run python server.py'}
              </p>
            </div>
          </div>

          {/* Quick Create Section */}
          <div id="create" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                Create New Viral Clip Project
              </h2>
            </div>
            <VideoUploader onCompleted={() => navigate('/clips')} />
          </div>

          {/* Recent Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-purple-400" />
                Recent Projects
              </h2>
              <Link to="/projects" className="text-xs font-semibold text-cyan-400 hover:underline">
                View all projects →
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 rounded-2xl glass-panel text-center text-gray-400 text-sm">
                No projects yet. Paste a YouTube video link above to generate your first clips!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((proj) => (
                  <div
                    key={proj.id}
                    className="glass-card p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <img
                        src={proj.thumbnail}
                        alt={proj.title}
                        className="w-20 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {proj.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                          <span>{proj.clipsCount || proj.clips?.length || 0} Clips</span>
                          <span>•</span>
                          <span>Duration: {proj.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenProject(proj)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold border border-cyan-500/30 transition-colors"
                      >
                        View Clips
                      </button>
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Download Modal */}
          {downloadModalClip && (
            <DownloadModal
              clip={downloadModalClip}
              videoId={currentProject?.videoId}
              projectTitle={currentProject?.title}
              onClose={() => setDownloadModalClip(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

