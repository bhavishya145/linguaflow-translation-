import React, { useState, useMemo } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  Copy, 
  Heart, 
  ArrowRight, 
  Volume2, 
  RotateCcw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { HistoryItem } from '../types';
import { getLanguageByCode } from '../constants/languages';
import { ttsService } from '../services/audioService';

interface TranslationHistoryProps {
  history: HistoryItem[];
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onSelectTranslation: (original: string, sourceLang: string, targetLang: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export const TranslationHistory: React.FC<TranslationHistoryProps> = ({
  history,
  onToggleFavorite,
  onDeleteItem,
  onClearHistory,
  onSelectTranslation,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return history;
    return history.filter(
      (item) =>
        item.originalText.toLowerCase().includes(q) ||
        item.translatedText.toLowerCase().includes(q) ||
        item.sourceLang.toLowerCase().includes(q) ||
        item.targetLang.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Copied to clipboard', '', 'success');
  };

  const handlePlayTTS = (text: string, langCode: string) => {
    ttsService.speak({ text, langCode });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <HistoryIcon className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              Translation History
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, search, reuse, and manage all your past neural translations
          </p>
        </div>

        {/* Clear All button */}
        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all translation history?')) {
                onClearHistory();
                onShowToast('History cleared', '', 'info');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-xs font-semibold text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
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
          placeholder="Search by keywords, translated phrases, or language..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
        />
      </div>

      {/* History Items List */}
      <div className="mt-6 space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-slate-900/30 border border-slate-800/80">
            <HistoryIcon className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-slate-300">No translation records found</h4>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? `No results matching "${searchQuery}"` : 'Translations will be saved here automatically'}
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const sLang = getLanguageByCode(item.sourceLang);
            const tLang = getLanguageByCode(item.targetLang);

            return (
              <div
                key={item.id}
                className="group p-4 sm:p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200 shadow-md hover:shadow-cyan-950/20"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/70 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <span>{sLang.flag}</span>
                      <span>{sLang.name}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="flex items-center gap-1 font-semibold text-cyan-300">
                      <span>{tLang.flag}</span>
                      <span>{tLang.name}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.isFavorite
                            ? 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-rose-400 border-slate-800'
                        }`}
                        title="Favorite"
                      >
                        <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-950/60 text-slate-300">
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Source Text</div>
                    <p className="leading-relaxed">{item.originalText}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-cyan-400 uppercase font-mono mb-1">Translation</div>
                      <p className="leading-relaxed">{item.translatedText}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlayTTS(item.translatedText, item.targetLang)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                        <button
                          onClick={() => handleCopy(item.translatedText)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                      </div>

                      <button
                        onClick={() => onSelectTranslation(item.originalText, item.sourceLang, item.targetLang)}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Open in Translator</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
