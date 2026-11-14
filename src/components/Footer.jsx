import React from 'react';
import { Zap, Github, Twitter, Youtube, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-dark/90 backdrop-blur-md pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Shorty<span className="text-cyan-400">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              The AI video clipping platform that turns long-form content into viral shorts with dynamic captions, smart reframing, and virality scoring.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/sivasagar112-eng/Shorty.AI"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">AI Video Clipper</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Dynamic Captions</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">9:16 Video Reframing</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Virality Score Engine</a></li>
              <li><Link to="/editor" className="hover:text-cyan-400 transition-colors">Interactive Editor</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition-colors">Frequently Asked Questions</a></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">User Dashboard</Link></li>
              <li><a href="https://github.com/sivasagar112-eng/Shorty.AI" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">GitHub Repository</a></li>
            </ul>
          </div>

          {/* Local Companion & Tech */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Local Engine</h4>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Powered by local FFmpeg and high-speed yt-dlp remuxing. Clips are saved directly to your machine.
            </p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-gray-400">Resolution</span>
                <span className="font-semibold text-cyan-400">1080p Full HD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Export</span>
                <span className="font-semibold text-emerald-400">Direct MP4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Shorty.AI. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-gray-400">
            Developed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> by{' '}
            <span className="text-cyan-400 font-semibold">Siva sagar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

