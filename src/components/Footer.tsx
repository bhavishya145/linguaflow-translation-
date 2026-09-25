import React from 'react';
import { Languages, Shield, Terminal, Accessibility, Heart, Radio } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenShortcuts: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenShortcuts }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-10 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Languages className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wider text-slate-200">
                LINGUAFLOW AI
              </div>
              <p className="text-[11px] text-slate-400">
                Powered by AI • Built for global communication
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy & Security</span>
            </button>

            <button
              onClick={onOpenShortcuts}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Shortcuts</span>
            </button>

            <span className="flex items-center gap-1.5 text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>API Gateway: Operational</span>
            </span>

            <span className="flex items-center gap-1.5 text-slate-400">
              <Accessibility className="w-3.5 h-3.5 text-indigo-400" />
              <span>WCAG AA Accessible</span>
            </span>
          </div>

          {/* Copyright */}
          <div className="text-[11px] text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} LinguaFlow AI Studio. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
};
