import React from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Zap, 
  Volume2, 
  ShieldCheck, 
  Trash2, 
  Sparkles, 
  Sliders,
  Check
} from 'lucide-react';
import { AppSettings } from '../types';
import { LANGUAGES } from '../constants/languages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
  onClearHistory,
  onShowToast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">LinguaFlow Studio Settings</h3>
              <p className="text-xs text-slate-400">Configure neural models, themes, speech rate & privacy</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form Body */}
        <div className="mt-5 space-y-6 text-sm">
          
          {/* Theme Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Visual Theme</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'dark', label: 'Dark Futuristic', icon: <Moon className="w-4 h-4 text-cyan-400" /> },
                { id: 'amoled', label: 'AMOLED Pure', icon: <Zap className="w-4 h-4 text-fuchsia-400" /> },
                { id: 'light', label: 'Light Studio', icon: <Sun className="w-4 h-4 text-amber-400" /> },
              ].map((theme) => {
                const isActive = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => updateSettings({ theme: theme.id as any })}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {theme.icon}
                    <span>{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Translation Provider */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Translation Provider Engine</label>
            <div className="space-y-2">
              {[
                { id: 'auto', title: 'Auto Intelligent Router', desc: 'Selects fastest high-fidelity engine (Gemini 3.8 / Cloud API)' },
                { id: 'gemini', title: 'Gemini 3.8 Flash Neural Engine', desc: 'High nuance contextual AI translation with idiom analysis' },
                { id: 'google_translate', title: 'Google Cloud Translation API', desc: 'Enterprise Google Cloud v2 Translation gateway' },
                { id: 'demo', title: 'Offline Neural Demo Simulator', desc: 'Instant local lexical mappings with zero latency' },
              ].map((p) => {
                const isSelected = settings.preferredProvider === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => updateSettings({ preferredProvider: p.id as any })}
                    className={`w-full flex items-start justify-between p-3 rounded-xl border text-left transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-xs block text-slate-100">{p.title}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{p.desc}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speech Synthesis Speed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300">Speech Synthesis Playback Speed</label>
              <span className="text-xs font-mono text-cyan-400 font-semibold">{settings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.25"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          {/* Default Languages */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Default Source</label>
              <select
                value={settings.defaultSource}
                onChange={(e) => updateSettings({ defaultSource: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="auto">Auto Detect</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Default Target</label>
              <select
                value={settings.defaultTarget}
                onChange={(e) => updateSettings({ defaultTarget: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Sound FX & Chimes</span>
                <span className="text-[11px] text-slate-400">Synthesized audio cues on translate, swap, and copy</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Atmospheric Animations</span>
                <span className="text-[11px] text-slate-400">Floating language characters and particle glows</span>
              </div>
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(e) => updateSettings({ animations: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy & Storage Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy Guarantee</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Translations are executed ephemerally via stateless server-side proxy routes. No personal text or conversation data is permanently retained on external servers. Translation history is stored locally in your browser sandbox.
            </p>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all stored history and favorites?')) {
                  onClearHistory();
                  onShowToast('Local data cleared', '', 'info');
                }
              }}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset & Clear Local Storage</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
