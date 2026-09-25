import React from 'react';
import { 
  Languages, 
  MessageSquare, 
  FileText, 
  Mic, 
  Heart, 
  History, 
  BarChart3, 
  Settings, 
  Keyboard, 
  Sun, 
  Moon, 
  Sparkles,
  Zap
} from 'lucide-react';
import { ActiveTab, AppSettings } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  providerStatus: { geminiAvailable: boolean; googleTranslateAvailable: boolean; activeProvider: string };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  updateSettings,
  onOpenSettings,
  onOpenShortcuts,
  providerStatus,
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'amoled' : settings.theme === 'amoled' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'translate', label: 'Translate', icon: <Languages className="w-4 h-4" /> },
    { id: 'conversation', label: 'Conversation', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'voice', label: 'Voice', icon: <Mic className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo with Speech Bubble + Globe + AI Circuit Icon */}
          <div 
            onClick={() => setActiveTab('translate')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden relative">
                {/* Subtle circuit lines background */}
                <svg className="absolute inset-0 w-full h-full opacity-40 text-cyan-400" viewBox="0 0 40 40" fill="none">
                  <path d="M4 20H12L16 12L20 28L24 20H36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
                </svg>
                {/* Stylized speech bubble + globe glyph */}
                <div className="relative flex items-center justify-center">
                  <Languages className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-blue-300 to-fuchsia-400 bg-clip-text text-transparent">
                  LINGUAFLOW
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide hidden sm:block">
                Neural Multilingual Studio
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            
            {/* Active Provider Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
              <span className={`w-2 h-2 rounded-full ${
                providerStatus.geminiAvailable 
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' 
                  : providerStatus.googleTranslateAvailable 
                  ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' 
                  : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
              }`} />
              <span className="font-medium text-slate-400">Engine:</span>
              <span className="text-cyan-300 font-semibold">
                {providerStatus.geminiAvailable 
                  ? 'Gemini 3.8 Flash' 
                  : providerStatus.googleTranslateAvailable 
                  ? 'Google Cloud' 
                  : 'Demo Mode'}
              </span>
            </div>

            {/* Keyboard Shortcuts button */}
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (Press ?)"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
              aria-label="View keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Theme: ${settings.theme.toUpperCase()}`}
              className="flex items-center gap-1.5 p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
              aria-label="Toggle theme mode"
            >
              {settings.theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : settings.theme === 'amoled' ? (
                <Zap className="w-4 h-4 text-fuchsia-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Settings"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Subnavigation Tabs */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/50">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
