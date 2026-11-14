import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Server,
  FolderOpen,
  Check,
  Shield,
  Film,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { openDownloadsFolder } from '../services/apiService';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { serverStatus } = useProject();

  const [name, setName] = useState(user?.name || 'Siva Sagar');
  const [email, setEmail] = useState(user?.email || 'sivasagar1309@outlook.com');
  const [defaultQuality, setDefaultQuality] = useState('1080');
  const [defaultAspect, setDefaultAspect] = useState('9:16');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, email });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8 max-w-4xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Customize your profile, default export resolutions, and companion server status.
            </p>
          </div>

          {/* Profile Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <User className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">User Profile</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full border-2 border-cyan-500/40 object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{name}</h3>
                  <p className="text-xs text-gray-400">{email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Pro Creator Tier
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl gradient-btn text-white text-xs font-bold flex items-center space-x-1.5"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                <span>{savedSuccess ? 'Saved Successfully' : 'Save Changes'}</span>
              </button>
            </form>
          </div>

          {/* Export Defaults */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <Film className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Default Export Settings</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Default Export Quality
                </label>
                <select
                  value={defaultQuality}
                  onChange={(e) => setDefaultQuality(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="1080">1080p Full HD (Crispest for Shorts)</option>
                  <option value="720">720p HD (Faster processing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Default Aspect Ratio
                </label>
                <select
                  value={defaultAspect}
                  onChange={(e) => setDefaultAspect(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="9:16">9:16 Vertical (TikTok, Reels, Shorts)</option>
                  <option value="1:1">1:1 Square (Instagram, LinkedIn)</option>
                  <option value="16:9">16:9 Landscape</option>
                </select>
              </div>
            </div>
          </div>

          {/* Local Companion Server Diagnostics */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <Server className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Local Companion Diagnostics</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-gray-300">Server Connection</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full ${
                    serverStatus.online
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {serverStatus.online ? 'Online (http://localhost:5000)' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-gray-300">FFmpeg Binary Engine</span>
                <span className="font-mono text-cyan-400">
                  {serverStatus.ffmpeg ? 'Detected & Loaded' : 'Not detected'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-gray-300">yt-dlp Extraction Library</span>
                <span className="font-mono text-emerald-400">
                  {serverStatus.yt_dlp ? 'Available' : 'Check requirements'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleOpenFolder}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
                >
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span>Open Clips Storage Folder on Computer</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

