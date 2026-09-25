import React, { useState } from 'react';
import { 
  Sparkles, 
  Gauge, 
  Clock, 
  FileText, 
  HelpCircle, 
  Wand2, 
  Check, 
  Copy, 
  RotateCcw,
  Sliders,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { InsightData } from '../types';
import { apiService } from '../services/apiService';
import { soundFX } from '../services/audioService';

interface AIInsightsProps {
  insights: InsightData | null;
  detectedLangName?: string;
  originalText: string;
  translatedText: string;
  targetLang: string;
  onApplyNaturalRewrite: (newText: string) => void;
  onCopyText: (text: string) => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  insights,
  detectedLangName,
  originalText,
  translatedText,
  targetLang,
  onApplyNaturalRewrite,
  onCopyText,
}) => {
  const [rewriteStyle, setRewriteStyle] = useState<'natural' | 'professional' | 'casual' | 'poetic'>('natural');
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState<{ text: string; explanation: string } | null>(null);
  const [hasCopiedRewrite, setHasCopiedRewrite] = useState(false);

  const handleRewrite = async () => {
    if (!translatedText || isRewriting) return;
    setIsRewriting(true);
    try {
      const res = await apiService.rewriteNatural(translatedText, targetLang, rewriteStyle);
      setRewriteResult({
        text: res.rewrittenText,
        explanation: res.explanation,
      });
      soundFX.playTranslateSuccess();
    } catch (err) {
      console.error('Rewrite failed:', err);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopy = (text: string) => {
    onCopyText(text);
    setHasCopiedRewrite(true);
    setTimeout(() => setHasCopiedRewrite(false), 2000);
  };

  if (!insights) return null;

  return (
    <div className="mt-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 sm:p-6 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>AI Translation Insights</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Neural Analytics
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Linguistic quality analysis & contextual nuance evaluation
            </p>
          </div>
        </div>

        {/* Confidence metric */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Confidence:</span>
          <span className="font-bold text-cyan-300">{insights.confidence}%</span>
        </div>
      </div>

      {/* Grid of Key Insights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
        {/* Detected Language */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Source Language</span>
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs sm:text-sm">
            <span>{detectedLangName || 'Detected'}</span>
          </div>
        </div>

        {/* Formality */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Formality Level</span>
          <div className="flex items-center gap-1.5 font-semibold text-cyan-300 text-xs sm:text-sm">
            <span>{insights.formality}</span>
          </div>
        </div>

        {/* Tone */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Detected Tone</span>
          <div className="flex items-center gap-1.5 font-semibold text-indigo-300 text-xs sm:text-sm">
            <span>{insights.tone}</span>
          </div>
        </div>

        {/* Reading Time */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Reading Time</span>
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>~{insights.estimatedReadingTimeSec} sec</span>
            <span className="text-[10px] text-slate-500 font-normal">({insights.wordCount} words)</span>
          </div>
        </div>
      </div>

      {/* Visual Neural Quality Meter */}
      <div className="mt-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800/90">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            Translation Quality Breakdown
          </span>
          <span className="text-[10px] text-slate-500 italic">
            AI-generated linguistic neural estimates
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Accuracy */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Accuracy & Syntax</span>
              <span className="font-mono text-cyan-300 font-semibold">{insights.accuracyRating}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${insights.accuracyRating}%` }}
              />
            </div>
          </div>

          {/* Fluency */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Fluency & Cadence</span>
              <span className="font-mono text-indigo-300 font-semibold">{insights.fluencyRating}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${insights.fluencyRating}%` }}
              />
            </div>
          </div>

          {/* Naturalness */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Cultural Naturalness</span>
              <span className="font-mono text-fuchsia-300 font-semibold">{insights.naturalnessRating}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-700"
                style={{ width: `${insights.naturalnessRating}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nuance Note */}
        {insights.nuanceNote && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
            <span className="text-cyan-400 font-bold shrink-0">Linguistic Note:</span>
            <span className="text-slate-400 leading-relaxed">{insights.nuanceNote}</span>
          </div>
        )}
      </div>

      {/* "More Natural Translation" AI-Enhanced Rewriting Section */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-950/30 via-slate-950 to-cyan-950/20 border border-indigo-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-200">
              Need a More Natural, Idiomatic Expression?
            </h4>
          </div>

          {/* Style Selector */}
          <div className="flex items-center gap-1.5">
            {(['natural', 'professional', 'casual', 'poetic'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setRewriteStyle(style)}
                className={`px-2.5 py-1 rounded-md text-[11px] capitalize font-medium transition-colors ${
                  rewriteStyle === style
                    ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {style}
              </button>
            ))}

            <button
              onClick={handleRewrite}
              disabled={isRewriting}
              className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all active:scale-95"
            >
              {isRewriting ? (
                <span className="inline-block animate-spin">⟳</span>
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>{isRewriting ? 'Enhancing...' : 'Enhance with AI'}</span>
            </button>
          </div>
        </div>

        {/* Rewritten output display */}
        {rewriteResult && (
          <div className="mt-3.5 p-3.5 rounded-lg bg-slate-900/90 border border-indigo-500/40 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                AI Enhanced Rewriting ({rewriteStyle})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(rewriteResult.text)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{hasCopiedRewrite ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => onApplyNaturalRewrite(rewriteResult.text)}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-200 font-semibold transition-colors"
                >
                  <span>Apply to result</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-100 leading-relaxed">
              {rewriteResult.text}
            </p>

            {rewriteResult.explanation && (
              <p className="mt-2 text-xs text-slate-400 border-t border-slate-800 pt-2 italic">
                💡 {rewriteResult.explanation}
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
