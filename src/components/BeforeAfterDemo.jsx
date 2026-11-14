import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Wand2, CheckCircle, SplitSquareVertical, Smartphone, Monitor } from 'lucide-react';

export default function BeforeAfterDemo() {
  const [activeLayout, setActiveLayout] = useState('single'); // 'single' | 'split'
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const sampleSubtitles = [
    'IF', 'YOU', 'WANT', 'TO', 'BUILD', 'SOMETHING', 'VIRAL,',
    'STOP', 'TALKING', 'ABOUT', 'FEATURES', 'AND', 'FOCUS', 'ON', 'THE', 'HOOK.'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % sampleSubtitles.length);
    }, 350);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto my-16 px-4">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Wand2 className="w-3.5 h-3.5" />
          <span>Interactive AI Demo</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          See How AI Transforms <span className="gradient-text">16:9 Into 9:16</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-400">
          Shorty.AI automatically identifies the speaker, tracks movement, cuts silence, and overlays animated viral captions.
        </p>

        {/* Layout Switcher */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            onClick={() => setActiveLayout('single')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeLayout === 'single'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Single Speaker Reframing</span>
          </button>
          <button
            onClick={() => setActiveLayout('split')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeLayout === 'split'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Screen Layout</span>
          </button>
        </div>
      </div>

      {/* Comparison Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Original 16:9 Landscape Video (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-2">
            <span className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-gray-500" />
              Original Video (16:9)
            </span>
            <span className="text-gray-500">Uncut • No Captions</span>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/80 shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=800&auto=format&fit=crop&q=80"
              alt="Raw podcast"
              className="w-full h-full object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <div className="w-full flex items-center justify-between text-xs text-gray-300">
                <span className="bg-black/60 px-2 py-1 rounded backdrop-blur font-mono">14:28 / 52:10</span>
                <span className="text-gray-400 text-[11px]">Static camera angle</span>
              </div>
            </div>
            {/* Center Play Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Play className="w-5 h-5 text-white/70 fill-white/70 ml-0.5" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span>⚠️ Retention Risk:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Standard 16:9 content suffers 70% drop-off in the first 3 seconds on mobile feeds due to small framing and lack of dynamic captions.
            </p>
          </div>
        </div>

        {/* Center Arrow / Transform Badge (2 cols) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center py-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white animate-float">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-cyan-400 mt-2 uppercase tracking-wider">
            AI Magic
          </span>
          <span className="text-[10px] text-gray-500 text-center mt-0.5">
            Auto Face-Tracking & Subtitles
          </span>
        </div>

        {/* Right: AI-Reframed 9:16 Short (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold px-2">
            <span className="text-cyan-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              Viral Short (9:16 Vertical)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              96 Viral Score
            </span>
          </div>

          {/* 9:16 Mobile Mockup Frame */}
          <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-cyan-500/40 bg-black shadow-glow-cyan flex flex-col justify-between">
            {/* Background / Speaker Video */}
            {activeLayout === 'single' ? (
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  alt="Tracked speaker"
                  className="w-full h-full object-cover filter brightness-90 transform scale-105"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col">
                <div className="h-1/2 w-full border-b border-cyan-500/30 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    alt="Speaker top"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-1/2 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80"
                    alt="Reacting guest or gameplay bottom"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Top Bar of Mobile Short */}
            <div className="relative z-10 p-3 flex items-center justify-between text-white text-xs">
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-bold border border-white/10">
                Shorty.AI Reframe
              </span>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>

            {/* Real-time Dynamic Animated Captions (Center/Bottom Overlay) */}
            <div className="relative z-10 p-4 text-center">
              <div className="inline-block px-3 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-black tracking-wide">
                  {sampleSubtitles.map((word, idx) => (
                    <span
                      key={idx}
                      className={`transition-all duration-150 uppercase ${
                        idx === activeWordIndex
                          ? 'text-yellow-300 scale-125 font-black drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]'
                          : 'text-white/90 font-bold'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Bar inside video */}
              <div className="w-full h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${((activeWordIndex + 1) / sampleSubtitles.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between">
            <span>✨ Result: Ready for TikTok, Reels & Shorts</span>
            <span className="font-bold">1080p HD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

