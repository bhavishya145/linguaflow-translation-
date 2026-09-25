export interface Language {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  family: string;
  region: string;
  flag: string;
  rtl?: boolean;
  lat: number;
  lng: number;
  popular?: boolean;
}

export interface TranslationResult {
  id?: string;
  translatedText: string;
  detectedSourceLanguage?: string;
  detectedLanguageName?: string;
  confidence?: number;
  provider: 'gemini' | 'google_translate' | 'demo';
  isDemo?: boolean;
  timestamp?: number;
}

export interface HistoryItem {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  isFavorite: boolean;
  provider: string;
  confidence?: number;
}

export interface ConversationMessage {
  id: string;
  speaker: 'A' | 'B';
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

export interface InsightData {
  formality: string;
  tone: string;
  confidence: number;
  accuracyRating: number;
  fluencyRating: number;
  naturalnessRating: number;
  nuanceNote: string;
  wordCount: number;
  charCount: number;
  estimatedReadingTimeSec: number;
}

export interface AppSettings {
  theme: 'dark' | 'amoled' | 'light';
  defaultSource: string;
  defaultTarget: string;
  speechRate: number;
  speechPitch: number;
  autoDetect: boolean;
  soundEffects: boolean;
  animations: boolean;
  preferredProvider: 'auto' | 'gemini' | 'google_translate' | 'demo';
}

export type ActiveTab = 'translate' | 'conversation' | 'documents' | 'voice' | 'favorites' | 'history' | 'dashboard';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}
