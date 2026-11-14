import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Play,
  Film,
  Layers,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Video,
  Download,
  Share2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VideoUploader from '../components/VideoUploader';
import BeforeAfterDemo from '../components/BeforeAfterDemo';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does Shorty.AI identify viral clips?',
      a: 'Shorty.AI analyzes speech patterns, high-energy punctuation, statistical disclosures, curiosity hooks, and emotional spikes using an advanced NLP scoring engine. Each moment is assigned a virality score from 0 to 100 with a detailed algorithmic explanation.',
    },
    {
      q: 'Where are the downloaded videos saved?',
      a: 'Clips are processed locally using your companion FFmpeg engine and downloaded directly to your computer’s Downloads folder (and the Shorty.AI/downloads directory) without redirecting to external cutter websites.',
    },
    {
      q: 'Can I choose between 720p and 1080p quality?',
      a: 'Yes! You can select 1080p Full HD or 720p HD anytime. The engine remuxes video and audio using FFmpeg to preserve crisp resolution for TikTok, Instagram Reels, and YouTube Shorts.',
    },
    {
      q: 'Does it support video reframing for vertical 9:16 format?',
      a: 'Yes. Shorty.AI supports 9:16 vertical shorts, 1:1 square feeds, 4:5 portrait, and 16:9 full landscape with custom blur backgrounds and dynamic word-by-word animated captions.',
    },
    {
      q: 'What video formats can I upload?',
      a: 'You can paste any YouTube URL directly, or drag and drop MP4, MOV, and WebM video files from your device.',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI Virality Scoring',
      desc: 'Instant 0–100 score for every moment based on retention metrics, keyword density, and emotional speech hooks.',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      icon: Film,
      title: 'Smart 9:16 Reframing',
      desc: 'Automatically reframe horizontal 16:9 videos into mobile-first vertical format with face-centering and background blur.',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      icon: Sparkles,
      title: 'Dynamic Animated Captions',
      desc: 'Word-by-word synchronized subtitles with karaoke highlighting, custom fonts, pop animations, and brand colors.',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    },
    {
      icon: Layers,
      title: 'AI Multi-Speaker Layouts',
      desc: 'Choose between single speaker focus, split-screen guest interviews, and picture-in-picture gaming overlays.',
      color: 'from-indigo-500/20 to-cyan-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      icon: Download,
      title: 'Direct Local MP4 Clipper',
      desc: 'No third-party cutter websites. Direct FFmpeg timeline clipping straight to your computer in 1080p.',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Sliders,
      title: 'Interactive Video Editor',
      desc: 'Fine-tune start and end timestamps, edit subtitle text, adjust fonts, and test aspect ratios live before export.',
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col text-white selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 backdrop-blur shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Next-Gen AI Video Repurposing</span>
              <span className="text-gray-500">•</span>
              <span className="text-cyan-400">100% Free Local Companion</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Turn Long Videos Into{' '}
              <span className="gradient-text">Viral Shorts</span> With AI
            </h1>

            {/* Description */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 leading-relaxed font-normal">
              Extract the highest retention moments from podcasts, webinars, and YouTube videos.
              Reframe into 9:16 vertical shorts with synchronized dynamic captions in seconds.
            </p>

            {/* Prominent Video Uploader */}
            <div className="pt-6">
              <VideoUploader />
            </div>

            {/* Platform Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
              <span>Optimized for:</span>
              <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-500" /> YouTube Shorts
              </span>
              <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-pink-500" /> TikTok
              </span>
              <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" /> Instagram Reels
              </span>
              <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> 1080p Full HD
              </span>
            </div>
          </div>
        </section>

        {/* Interactive Before & After Demo */}
        <section className="border-t border-white/10 bg-brand-card/40 py-16">
          <BeforeAfterDemo />
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Engineered For Content Creators
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything You Need to 10x Your Reach
            </p>
            <p className="mt-3 text-sm text-gray-400">
              Shorty.AI combines intelligent speech recognition, visual reframing, and virality scoring into one seamless workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all space-y-4 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-gradient-to-tr ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-brand-card/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
                Simple 3-Step Pipeline
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                From Raw Video to 10 Viral Shorts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Import or Upload',
                  desc: 'Paste any YouTube URL or drop your video file (MP4, MOV, WebM). Shorty.AI pulls transcripts and visual data immediately.',
                },
                {
                  step: '02',
                  title: 'AI Scores & Reframes',
                  desc: 'The NLP engine identifies high-energy hooks and emotional statements, auto-scores virality, and reframes the video to 9:16.',
                },
                {
                  step: '03',
                  title: 'Edit & Export Direct',
                  desc: 'Customize word-by-word subtitles, tweak the start/end boundaries in the video editor, and export directly in 1080p MP4.',
                },
              ].map((item, i) => (
                <div key={i} className="relative p-6 rounded-2xl glass-panel border border-white/10 space-y-3">
                  <span className="text-4xl font-black text-white/10 font-mono">
                    {item.step}
                  </span>
                  <h4 className="text-lg font-bold text-white">{item.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Got Questions?
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-white font-semibold text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-gradient-to-b from-brand-card/40 to-black text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Turn Long Videos Into <span className="gradient-text">Viral Gold</span>?
            </h2>
            <p className="text-base text-gray-400">
              Start clipping your videos now with instant virality scoring and direct MP4 export.
            </p>
            <div>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl gradient-btn text-white text-base font-bold shadow-xl shadow-cyan-500/25"
              >
                <Sparkles className="w-5 h-5" />
                <span>Paste Your First Video Above</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

