import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Film,
  SlidersHorizontal,
  Settings,
  FolderOpen,
  Zap,
  Server,
  ExternalLink,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { openDownloadsFolder } from '../services/apiService';

export default function Sidebar() {
  const { serverStatus } = useProject();
  const { user } = useAuth();

  const handleOpenFolder = async () => {
    try {
      await openDownloadsFolder();
    } catch {
      alert('Your clips are saved in your Downloads folder and Shorty.AI/downloads');
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/clips', label: 'Generated Clips', icon: Film },
    { to: '/editor', label: 'Video Editor', icon: SlidersHorizontal },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-brand-dark/95 backdrop-blur-xl flex flex-col h-[calc(100vh-80px)] sticky top-20 select-none">
      {/* Action CTA */}
      <div className="p-4">
        <NavLink
          to="/dashboard"
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl gradient-btn text-white text-sm font-semibold shadow-lg shadow-cyan-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Video Project</span>
        </NavLink>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
          Workspace
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-white border border-cyan-500/30 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 text-cyan-400" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Companion Server Info Box */}
      <div className="p-4 border-t border-white/10">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Local Clipper
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                serverStatus.online
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {serverStatus.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            {serverStatus.online
              ? 'FFmpeg & yt-dlp connected at port 5000'
              : 'Launch "python server.py" for direct PC clipping'}
          </p>
          <button
            onClick={handleOpenFolder}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open Clips Folder</span>
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center space-x-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-cyan-500/30 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

