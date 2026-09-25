import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Search, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Volume2, 
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';
import { HistoryItem } from '../types';
import { getLanguageByCode } from '../constants/languages';
import { ttsService } from '../services/audioService';

interface FavoritesViewProps {
  favorites: HistoryItem[];
  onToggleFavorite: (id: string) => void;
  onSelectTranslation: (original: string, sourceLang: string, targetLang: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onToggleFavorite,
  onSelectTranslation,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFavorites = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return favorites;
    return favorites.filter(
      (item) =>
        item.originalText.toLowerCase().includes(q) ||
        item.translatedText.toLowerCase().includes(q) ||
        item.sourceLang.toLowerCase().includes(q) ||
        item.targetLang.toLowerCase().includes(q)
    );
  }, [favorites, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Copied to clipboard', '', 'success');
  };

  const handleExportAll = () => {
    if (favorites.length === 0) return;
    const jsonStr = JSON.stringify(favorites, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linguaflow-favorites-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Favorites exported', `Saved as JSON`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Heart className="w-4 h-4 fill-rose-500" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              Saved Favorites
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pinned translations, key phrases, and frequently needed multilingual references
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Favorites (JSON)</span>
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="mt-6 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved phrases..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
        />
      </div>

      {/* Favorites Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFavorites.length === 0 ? (
          <div className="col-span-full text-center py-16 rounded-3xl bg-slate-900/30 border border-slate-800/80">
            <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-slate-300">No favorite translations yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Click the heart icon on any translation in the console to save it here
            </p>
          </div>
        ) : (
          filteredFavorites.map((item) => {
            const sLang = getLanguageByCode(item.sourceLang);
            const tLang = getLanguageByCode(item.targetLang);

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-rose-500/40 transition-all duration-200 shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top bar */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/70 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <span>{sLang.flag} {sLang.name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="text-cyan-300">{tLang.flag} {tLang.name}</span>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1 rounded-md text-rose-400 hover:text-slate-400 transition-colors"
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>

                  {/* Texts */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 line-clamp-2 italic">
                      "{item.originalText}"
                    </p>
                    <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                      {item.translatedText}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => ttsService.speak({ text: item.translatedText, langCode: item.targetLang })}
                      className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>

                    <button
                      onClick={() => handleCopy(item.translatedText)}
                      className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectTranslation(item.originalText, item.sourceLang, item.targetLang)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Open in Console</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
