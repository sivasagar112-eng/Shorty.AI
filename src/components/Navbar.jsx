import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Sparkles, FolderOpen, Menu, X, CheckCircle2, AlertCircle, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { openDownloadsFolder } from '../services/apiService';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { serverStatus } = useProject();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleOpenFolder = async () => {
    try {
      await openDownloadsFolder();
    } catch {
      alert('Your clipped videos are saved in your Downloads folder and Shorty.AI/downloads');
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Shorty<span className="text-cyan-400">.AI</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Pro
                </span>
              </span>
              <span className="text-[11px] text-gray-400 font-medium">Turn Videos Into Viral Shorts</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#faq" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              FAQ
            </a>

            {/* Server Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
              {serverStatus.online ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400 font-medium">Server Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-gray-400">Companion Offline</span>
                </>
              )}
            </div>

            {/* Open Clips Folder Button */}
            <button
              onClick={handleOpenFolder}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 transition-all hover:scale-105"
              title="Open local clips folder"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Clips Folder</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center space-x-3 pl-2 border-l border-white/10">
                  <Link to="/settings" className="flex items-center space-x-2 group">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full border border-cyan-500/40 object-cover"
                    />
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started Free</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-brand-dark/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-200 hover:text-white py-2"
          >
            Home
          </Link>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-300 hover:text-white py-2"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-300 hover:text-white py-2"
          >
            How It Works
          </a>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-white/10 text-white font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Go to Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-gray-200 bg-white/5 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center gradient-btn py-2.5 rounded-xl text-white font-semibold"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

