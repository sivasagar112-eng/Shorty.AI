import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  PlusCircle,
  Film,
  Clock,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useProject } from '../context/ProjectContext';

export default function Projects() {
  const navigate = useNavigate();
  const { projects, setCurrentProject, deleteProject } = useProject();
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenClips = (proj) => {
    setCurrentProject(proj);
    navigate('/clips');
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col text-white">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Projects
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                All your video workspaces, detected viral moments, and generated shorts.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard#create')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Projects Grid */}
          {filtered.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel text-center space-y-3">
              <FolderKanban className="w-12 h-12 mx-auto text-gray-600" />
              <h3 className="text-base font-bold text-white">No projects found</h3>
              <p className="text-xs text-gray-400">
                {search ? 'Try another search term.' : 'Get started by creating your first video project.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((proj) => (
                <div
                  key={proj.id}
                  className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={proj.thumbnail}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <div className="w-full flex items-center justify-between text-xs text-white">
                        <span className="font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                          {proj.duration}
                        </span>
                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {proj.clipsCount || proj.clips?.length || 0} Clips
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Created on {new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenClips(proj)}
                        className="px-4 py-2 rounded-xl gradient-btn text-white text-xs font-bold shadow-sm shadow-cyan-500/30 flex items-center space-x-1.5"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>View Clips</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

