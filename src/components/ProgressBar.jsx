import React from 'react';
import { CheckCircle2, Loader2, Sparkles, Film, FileText, Cpu } from 'lucide-react';

const STEPS = [
  { id: 0, title: 'Fetching Metadata', desc: 'Validating stream & video info', icon: Film },
  { id: 1, title: 'Extracting Transcript', desc: 'Retrieving timestamped audio subtitles', icon: FileText },
  { id: 2, title: 'AI Virality Analysis', desc: 'Scoring hooks, emotional cues & keywords', icon: Cpu },
  { id: 3, title: 'Reframing & Shorts', desc: 'Generating 9:16 clips with captions', icon: Sparkles },
];

export default function ProgressBar({ currentStep = 0, isAnalyzing = false }) {
  if (!isAnalyzing) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-8 p-6 rounded-2xl glass-panel border border-cyan-500/30 shadow-glow-cyan animate-fadeIn">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Processing Video with AI
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Detecting high-retention moments and creating viral short clips...
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Analyzing...</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative mb-8">
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 transition-all duration-500 ease-out rounded-full shadow-lg shadow-cyan-500/50"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : isDone
                  ? 'bg-white/5 border-emerald-500/30 text-gray-300'
                  : 'bg-white/[0.02] border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCurrent
                      ? 'bg-cyan-500 text-black'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-gray-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-gray-400">0{step.id + 1}</span>
              </div>
              <h4 className="text-xs font-semibold text-white truncate">{step.title}</h4>
              <p className="text-[10px] text-gray-400 line-clamp-1">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

