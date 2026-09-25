import { HistoryItem, AppSettings } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'linguaflow_history_v1',
  SETTINGS: 'linguaflow_settings_v1',
  STATS: 'linguaflow_stats_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultSource: 'auto',
  defaultTarget: 'es',
  speechRate: 1.0,
  speechPitch: 1.0,
  autoDetect: true,
  soundEffects: true,
  animations: true,
  preferredProvider: 'auto',
};

const SEED_HISTORY: HistoryItem[] = [
  {
    id: 'seed-1',
    originalText: 'Break language barriers with AI',
    translatedText: 'Rompe las barreras del idioma con IA',
    sourceLang: 'en',
    targetLang: 'es',
    timestamp: Date.now() - 1000 * 60 * 18,
    isFavorite: true,
    provider: 'gemini',
    confidence: 0.99,
  },
  {
    id: 'seed-2',
    originalText: 'Break language barriers with AI',
    translatedText: 'செயற்கை நுண்ணறிவு மூலம் மொழி தடைகளை தகர்க்கவும்',
    sourceLang: 'en',
    targetLang: 'ta',
    timestamp: Date.now() - 1000 * 60 * 45,
    isFavorite: true,
    provider: 'gemini',
    confidence: 0.98,
  },
  {
    id: 'seed-3',
    originalText: 'Break language barriers with AI',
    translatedText: 'एआई के साथ भाषा की बाधाओं को तोड़ें',
    sourceLang: 'en',
    targetLang: 'hi',
    timestamp: Date.now() - 1000 * 60 * 120,
    isFavorite: false,
    provider: 'gemini',
    confidence: 0.98,
  },
  {
    id: 'seed-4',
    originalText: 'Welcome to LinguaFlow',
    translatedText: 'LinguaFlowへようこそ',
    sourceLang: 'en',
    targetLang: 'ja',
    timestamp: Date.now() - 1000 * 60 * 240,
    isFavorite: true,
    provider: 'gemini',
    confidence: 0.99,
  },
];

export const storageService = {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(SEED_HISTORY));
        return SEED_HISTORY;
      }
      return JSON.parse(data);
    } catch {
      return SEED_HISTORY;
    }
  },

  addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
    const history = this.getHistory();
    // Avoid exact duplicate at the top
    if (history.length > 0 && history[0].originalText === item.originalText && history[0].targetLang === item.targetLang) {
      return history[0];
    }

    const newItem: HistoryItem = {
      ...item,
      id: 'h-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
    };

    const updated = [newItem, ...history].slice(0, 100);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history:', e);
    }

    this.incrementStats(item.sourceLang, item.targetLang);
    return newItem;
  },

  toggleFavorite(id: string): boolean {
    const history = this.getHistory();
    let isNowFavorite = false;
    const updated = history.map((item) => {
      if (item.id === id) {
        isNowFavorite = !item.isFavorite;
        return { ...item, isFavorite: isNowFavorite };
      }
      return item;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save favorite:', e);
    }
    return isNowFavorite;
  },

  deleteHistoryItem(id: string): void {
    const history = this.getHistory();
    const updated = history.filter((i) => i.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete history:', e);
    }
  },

  clearHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    } catch (e) {
      console.warn('Failed to clear history:', e);
    }
  },

  getStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {
      totalCount: 142,
      todayCount: 18,
      lastActiveDay: new Date().toDateString(),
      langCounts: {
        es: 34,
        ta: 28,
        hi: 24,
        ja: 19,
        fr: 17,
        de: 12,
        zh: 8,
      } as Record<string, number>,
    };
  },

  incrementStats(_source: string, target: string) {
    const stats = this.getStats();
    const today = new Date().toDateString();

    if (stats.lastActiveDay !== today) {
      stats.todayCount = 1;
      stats.lastActiveDay = today;
    } else {
      stats.todayCount += 1;
    }
    stats.totalCount += 1;

    if (!stats.langCounts) stats.langCounts = {};
    stats.langCounts[target] = (stats.langCounts[target] || 0) + 1;

    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to record stats:', e);
    }
  },
};
