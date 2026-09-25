/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveTab, AppSettings, HistoryItem, ToastMessage } from './types';
import { storageService, DEFAULT_SETTINGS } from './services/storageService';
import { soundFX } from './services/audioService';
import { apiService } from './services/apiService';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Translator } from './components/Translator';
import { ConversationMode } from './components/ConversationMode';
import { DocumentTranslator } from './components/DocumentTranslator';
import { VoiceStudio } from './components/VoiceStudio';
import { TranslationHistory } from './components/TranslationHistory';
import { FavoritesView } from './components/FavoritesView';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('translate');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  
  // Preload state for Translator when reloaded from History/Favorites
  const [translatorPreload, setTranslatorPreload] = useState<{
    text: string;
    sourceLang: string;
    targetLang: string;
  } | null>(null);

  const [providerStatus, setProviderStatus] = useState({
    geminiAvailable: false,
    googleTranslateAvailable: false,
    activeProvider: 'gemini',
  });

  const translatorRef = useRef<HTMLDivElement>(null);

  // Initialize settings and history
  useEffect(() => {
    const savedSettings = storageService.getSettings();
    setSettings(savedSettings);
    soundFX.setEnabled(savedSettings.soundEffects);

    const savedHistory = storageService.getHistory();
    setHistory(savedHistory);

    // Fetch server status
    apiService.getStatus().then((status) => {
      setProviderStatus(status);
    });
  }, []);

  // Sync theme class to html document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'amoled');

    if (settings.theme === 'light') {
      root.classList.add('light');
    } else if (settings.theme === 'amoled') {
      root.classList.add('dark', 'amoled');
    } else {
      root.classList.add('dark');
    }
  }, [settings.theme]);

  // Toast Helper
  const showToast = useCallback((title: string, description?: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storageService.saveSettings(updated);
      if (typeof newSettings.soundEffects === 'boolean') {
        soundFX.setEnabled(newSettings.soundEffects);
      }
      return updated;
    });
  };

  const handleToggleFavorite = (id: string) => {
    storageService.toggleFavorite(id);
    setHistory(storageService.getHistory());
  };

  const handleDeleteHistoryItem = (id: string) => {
    storageService.deleteHistoryItem(id);
    setHistory(storageService.getHistory());
    showToast('Item deleted', '', 'info');
  };

  const handleClearHistory = () => {
    storageService.clearHistory();
    setHistory([]);
    showToast('History cleared', '', 'info');
  };

  const handleSelectFromHistory = (original: string, sourceLang: string, targetLang: string) => {
    setTranslatorPreload({ text: original, sourceLang, targetLang });
    setActiveTab('translate');
    setTimeout(() => {
      translatorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea (except Esc)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }

      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        updateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        providerStatus={providerStatus}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'translate' && (
          <div>
            {/* Landing Hero */}
            <Hero
              onStartTranslating={() => {
                translatorRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreLanguages={() => {
                translatorRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Central Translator Console */}
            <div ref={translatorRef}>
              <Translator
                key={translatorPreload ? `${translatorPreload.text}-${Date.now()}` : 'default-translator'}
                settings={settings}
                onShowToast={showToast}
                initialSourceText={translatorPreload?.text}
                initialSourceLang={translatorPreload?.sourceLang}
                initialTargetLang={translatorPreload?.targetLang}
              />
            </div>
          </div>
        )}

        {activeTab === 'conversation' && (
          <ConversationMode
            settings={settings}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentTranslator
            settings={settings}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceStudio
            settings={settings}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={history.filter((h) => h.isFavorite)}
            onToggleFavorite={handleToggleFavorite}
            onSelectTranslation={handleSelectFromHistory}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'history' && (
          <TranslationHistory
            history={history}
            onToggleFavorite={handleToggleFavorite}
            onDeleteItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
            onSelectTranslation={handleSelectFromHistory}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            history={history}
            onSelectTranslation={handleSelectFromHistory}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Modals & Notifications */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={handleUpdateSettings}
        onClearHistory={handleClearHistory}
        onShowToast={showToast}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />

    </div>
  );
}
