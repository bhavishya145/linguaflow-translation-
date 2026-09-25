import React from 'react';
import { ArrowRight, Globe, Sparkles, Volume2, ShieldCheck, Zap } from 'lucide-react';

interface HeroProps {
  onStartTranslating: () => void;
  onExploreLanguages: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartTranslating, onExploreLanguages }) => {
  const floatingGlyphs = [
    { text: 'வணக்கம்', lang: 'Tamil', top: '12%', left: '8%', delay: '0s' },
    { text: '你好', lang: 'Mandarin', top: '24%', right: '10%', delay: '1.2s' },
    { text: 'नमस्ते', lang: 'Hindi', bottom: '22%', left: '12%', delay: '0.6s' },
    { text: 'Bonjour', lang: 'French', top: '15%', right: '28%', delay: '1.8s' },
    { text: 'Hola', lang: 'Spanish', bottom: '30%', right: '14%', delay: '2.4s' },
    { text: 'مرحبا', lang: 'Arabic', top: '35%', left: '18%', delay: '1.5s' },
    { text: 'Привет', lang: 'Russian', bottom: '15%', right: '24%', delay: '3.0s' },
    { text: 'Hello', lang: 'English', top: '10%', left: '42%', delay: '0.3s' },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-800/60">
      {/* Background glowing gradients & particle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/20 to-fuchsia-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating animated language characters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {floatingGlyphs.map((glyph, idx) => (
          <div
            key={idx}
            style={{
              top: glyph.top,
              bottom: glyph.bottom,
              left: glyph.left,
              right: glyph.right,
              animationDelay: glyph.delay,
            }}
            className="absolute hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 text-slate-300 text-xs font-medium shadow-lg shadow-cyan-950/30 animate-pulse transition-all duration-1000 hover:scale-110"
          >
            <span className="font-semibold text-cyan-300 text-sm">{glyph.text}</span>
            <span className="text-[10px] text-slate-400">· {glyph.lang}</span>
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtle kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>LINGUAFLOW NEURAL ENGINE 3.8</span>
          <span className="text-cyan-600">|</span>
          <span className="text-slate-300 font-normal">Next-Gen Linguistic AI</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.12]">
          Break Language Barriers with{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.25)]">
            AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Translate, understand and communicate across the world — instantly.
        </p>

        {/* Futuristic Interactive Globe Visualization Wireframe */}
        <div className="my-8 max-w-md mx-auto relative flex items-center justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Outer pulsating ring */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-25" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/30 animate-spin" style={{ animationDuration: '28s' }} />
            <div className="absolute inset-6 rounded-full border border-indigo-500/40" />

            {/* Glowing Globe SVG */}
            <svg viewBox="0 0 100 100" className="w-36 h-36 sm:w-44 sm:h-44 text-cyan-400/80 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              {/* Latitude circles */}
              <ellipse cx="50" cy="50" rx="42" ry="42" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
              <ellipse cx="50" cy="50" rx="42" ry="24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
              <ellipse cx="50" cy="50" rx="42" ry="10" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
              {/* Longitude circles */}
              <ellipse cx="50" cy="50" rx="22" ry="42" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
              <ellipse cx="50" cy="50" rx="10" ry="42" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
              <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
              <line x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
              
              {/* Animated language connection arc */}
              <path
                d="M 28 35 Q 50 18 72 38"
                fill="none"
                stroke="#ec4899"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <circle cx="28" cy="35" r="3" fill="#22d3ee" className="animate-ping" />
              <circle cx="28" cy="35" r="2.5" fill="#22d3ee" />
              <circle cx="72" cy="38" r="3" fill="#ec4899" />

              <path
                d="M 32 65 Q 52 78 68 60"
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle cx="32" cy="65" r="2" fill="#6366f1" />
              <circle cx="68" cy="60" r="2.5" fill="#a855f7" />
            </svg>

            {/* Central Badge */}
            <div className="absolute px-2.5 py-1 rounded-md bg-slate-950/80 border border-cyan-400/40 shadow-lg text-[10px] font-mono text-cyan-300">
              100+ LINGUISTIC NODES
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
          <button
            onClick={onStartTranslating}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-200 active:scale-[0.98]"
          >
            <span>Start Translating</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreLanguages}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 font-semibold text-sm border border-slate-700 hover:border-cyan-500/40 transition-all duration-200"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Explore Languages</span>
          </button>
        </div>

        {/* Small Statistics / Feature Highlights without clunky pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">100+</span>
            <span>Languages</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">•</span>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-slate-200">AI Powered</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200">Instant Translation</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">•</span>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-200">Voice Enabled</span>
          </div>
        </div>

      </div>
    </section>
  );
};
