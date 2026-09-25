import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter', mac: '⌘ + Enter', action: 'Instant Translate' },
    { key: 'Ctrl + Shift + S', mac: '⌘ + Shift + S', action: 'Swap Source and Target Languages' },
    { key: 'Ctrl + Shift + C', mac: '⌘ + Shift + C', action: 'Copy Translated Text' },
    { key: 'Esc', mac: 'Esc', action: 'Clear Input Area or Close Modals' },
    { key: '?', mac: '?', action: 'Open Keyboard Shortcuts Cheat Sheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 p-6"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">Power user workflow acceleration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2.5">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800"
            >
              <span className="text-xs font-medium text-slate-300">{sc.action}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono text-[11px] text-cyan-300 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
