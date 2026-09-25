import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Heart, 
  Globe2, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Activity
} from 'lucide-react';
import { HistoryItem } from '../types';
import { storageService } from '../services/storageService';
import { getLanguageByCode } from '../constants/languages';

interface DashboardProps {
  history: HistoryItem[];
  onSelectTranslation: (original: string, sourceLang: string, targetLang: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ history, onSelectTranslation }) => {
  const stats = useMemo(() => storageService.getStats(), [history]);

  const favoritesCount = useMemo(() => {
    return history.filter((h) => h.isFavorite).length;
  }, [history]);

  // Aggregate target languages usage from history
  const languageUsage = useMemo(() => {
    const counts: Record<string, number> = { ...stats.langCounts };
    history.forEach((h) => {
      counts[h.targetLang] = (counts[h.targetLang] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxVal = sorted.length > 0 ? sorted[0][1] : 1;

    return {
      items: sorted.slice(0, 6).map(([code, count]) => ({
        code,
        lang: getLanguageByCode(code),
        count,
        percentage: Math.round((count / maxVal) * 100),
      })),
      topLang: sorted.length > 0 ? getLanguageByCode(sorted[0][0]) : null,
    };
  }, [history, stats]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              Linguistic Analytics & Dashboard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global communication metrics, language distribution, and translation volume
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time Neural Telemetry Active</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Translations Today */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {stats.todayCount || history.length}
          </div>
          <p className="text-[11px] text-cyan-400/80 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active daily volume</span>
          </p>
        </div>

        {/* Total Translations */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {stats.totalCount || history.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Lifetime queries processed
          </p>
        </div>

        {/* Saved Favorites */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Favorites</span>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-300">
            {favoritesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Key phrases bookmarked
          </p>
        </div>

        {/* Top Language */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Target</span>
            <Globe2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 truncate">
            {languageUsage.topLang ? `${languageUsage.topLang.flag} ${languageUsage.topLang.name}` : 'Spanish'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Most frequent translation destination
          </p>
        </div>
      </div>

      {/* Grid: Language Usage Chart & Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Language Usage Visual Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Language Distribution Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400">Target frequency</span>
          </div>

          <div className="space-y-4">
            {languageUsage.items.map((item) => (
              <div key={item.code}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-2 font-medium text-slate-200">
                    <span className="text-base">{item.lang.flag}</span>
                    <span>{item.lang.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.lang.nativeName})</span>
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">{item.count} translations</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Translation Feed */}
        <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Recent Stream</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Live</span>
            </div>

            <div className="space-y-3">
              {history.slice(0, 4).map((item) => {
                const sLang = getLanguageByCode(item.sourceLang);
                const tLang = getLanguageByCode(item.targetLang);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectTranslation(item.originalText, item.sourceLang, item.targetLang)}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{sLang.name} ➔ {tLang.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium truncate">{item.translatedText}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400">
              Data synchronized to local client storage
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
