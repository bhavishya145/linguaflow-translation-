import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X, Sparkles, Globe2 } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES, AUTO_DETECT_OPTION } from '../constants/languages';

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  allowAutoDetect?: boolean;
  detectedLanguageCode?: string;
  label: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  allowAutoDetect = false,
  detectedLanguageCode,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'popular' | 'indic' | 'european' | 'asian'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Selected language object
  const selectedLang = useMemo(() => {
    if (value === 'auto') return AUTO_DETECT_OPTION;
    return LANGUAGES.find((l) => l.code === value) || {
      code: value,
      name: value.toUpperCase(),
      nativeName: value.toUpperCase(),
      flag: '🌐',
      script: '',
      family: '',
      region: '',
      lat: 0,
      lng: 0,
    };
  }, [value]);

  // Filtered languages based on search and category
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return LANGUAGES.filter((lang) => {
      const matchesSearch =
        !q ||
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        lang.family.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (category === 'popular') return !!lang.popular;
      if (category === 'indic') return lang.family.includes('Dravidian') || lang.family.includes('Indo-Aryan') || lang.region.includes('India');
      if (category === 'european') return lang.region.includes('Europe') || lang.family.includes('Romance') || lang.family.includes('Germanic') || lang.family.includes('Slavic');
      if (category === 'asian') return lang.family.includes('Sino-Tibetan') || lang.family.includes('Japonic') || lang.family.includes('Koreanic') || lang.region.includes('Asia');

      return true;
    });
  }, [searchQuery, category]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 shadow-sm text-left transition-all duration-200 group w-full min-w-[150px] sm:min-w-[180px]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg leading-none shrink-0" role="img" aria-label={selectedLang.name}>
            {selectedLang.flag}
          </span>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider leading-none">
              {label}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                {selectedLang.name}
              </span>
              {value === 'auto' && detectedLanguageCode && (
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-800">
                  {detectedLanguageCode.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 sm:w-84 max-h-[420px] rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Search Header */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language or script..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'popular', label: 'Popular' },
                { id: 'indic', label: 'Indic' },
                { id: 'asian', label: 'Asian' },
                { id: 'european', label: 'European' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCategory(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                    category === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Options List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-[300px] divide-y divide-slate-900/50">
            {/* Auto Detect option if enabled */}
            {allowAutoDetect && (
              <button
                type="button"
                onClick={() => {
                  onChange('auto');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                  value === 'auto'
                    ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200'
                    : 'hover:bg-slate-900 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Auto Detect</span>
                    <span className="text-[10px] text-slate-400">Multi-Script Neural Scanner</span>
                  </div>
                </div>
                {value === 'auto' && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
              </button>
            )}

            {filteredLanguages.map((lang) => {
              const isSelected = value === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200'
                      : 'hover:bg-slate-900/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{lang.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate text-slate-100">
                          {lang.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          ({lang.nativeName})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {lang.family} · {lang.script}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                <Globe2 className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
                No language found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
