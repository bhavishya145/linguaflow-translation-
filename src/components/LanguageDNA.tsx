import React from 'react';
import { Dna, ArrowRight, Compass, BookOpen, Layers, AlignLeft, Globe, MapPin } from 'lucide-react';
import { Language } from '../types';

interface LanguageDNAProps {
  sourceLang: Language;
  targetLang: Language;
  detectedLang?: Language;
}

export const LanguageDNA: React.FC<LanguageDNAProps> = ({
  sourceLang,
  targetLang,
  detectedLang,
}) => {
  const actualSource = sourceLang.code === 'auto' && detectedLang ? detectedLang : sourceLang;

  return (
    <div className="mt-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 sm:p-6 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-fuchsia-500/20 to-cyan-500/20 text-fuchsia-400 border border-fuchsia-500/30">
            <Dna className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Linguistic DNA & Typology</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800">
                Structural Genome
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparative philology, writing systems & genealogical language families
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          {actualSource.family} ➔ {targetLang.family}
        </div>
      </div>

      {/* Comparative Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Central Interconnection Node for Desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-950 border border-cyan-500/50 shadow-lg shadow-cyan-500/30 items-center justify-center text-cyan-300">
          <ArrowRight className="w-4 h-4" />
        </div>

        {/* Source Language DNA Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{actualSource.flag}</span>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{actualSource.name}</h4>
                <span className="text-xs text-slate-400">{actualSource.nativeName}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
              Origin
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Language Family
              </span>
              <span className="font-medium text-slate-200 text-right">{actualSource.family}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Writing System
              </span>
              <span className="font-medium text-slate-200 text-right">{actualSource.script}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Primary Region
              </span>
              <span className="font-medium text-slate-200 text-right">{actualSource.region}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
                Directionality
              </span>
              <span className="font-mono text-cyan-400">
                {actualSource.rtl ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
              </span>
            </div>
          </div>
        </div>

        {/* Target Language DNA Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{targetLang.flag}</span>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{targetLang.name}</h4>
                <span className="text-xs text-slate-400">{targetLang.nativeName}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
              Target
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Language Family
              </span>
              <span className="font-medium text-slate-200 text-right">{targetLang.family}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Writing System
              </span>
              <span className="font-medium text-slate-200 text-right">{targetLang.script}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                Primary Region
              </span>
              <span className="font-medium text-slate-200 text-right">{targetLang.region}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
                Directionality
              </span>
              <span className="font-mono text-indigo-400">
                {targetLang.rtl ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
