import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Trash2, 
  Clipboard, 
  Mic, 
  MicOff, 
  Volume2, 
  Square, 
  Pause, 
  Play, 
  Share2, 
  Download, 
  Heart, 
  Sparkles, 
  RotateCcw, 
  Upload, 
  AlertCircle,
  Zap,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Language, TranslationResult, InsightData, AppSettings } from '../types';
import { getLanguageByCode, LANGUAGES } from '../constants/languages';
import { LanguageSelector } from './LanguageSelector';
import { AIInsights } from './AIInsights';
import { LanguageDNA } from './LanguageDNA';
import { WorldLanguageMap } from './WorldLanguageMap';
import { apiService } from '../services/apiService';
import { soundFX, ttsService, createSpeechRecognizer, SpeechRecognitionWrapper } from '../services/audioService';
import { storageService } from '../services/storageService';

interface TranslatorProps {
  settings: AppSettings;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  initialSourceText?: string;
  initialSourceLang?: string;
  initialTargetLang?: string;
}

export const Translator: React.FC<TranslatorProps> = ({
  settings,
  onShowToast,
  initialSourceText = '',
  initialSourceLang,
  initialTargetLang,
}) => {
  const [sourceLangCode, setSourceLangCode] = useState<string>(initialSourceLang || settings.defaultSource || 'auto');
  const [targetLangCode, setTargetLangCode] = useState<string>(initialTargetLang || settings.defaultTarget || 'es');
  const [sourceText, setSourceText] = useState<string>(initialSourceText);
  const [translatedText, setTranslatedText] = useState<string>('');
  
  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedLangCode, setDetectedLangCode] = useState<string | undefined>(undefined);
  const [detectedLangName, setDetectedLangName] = useState<string | undefined>(undefined);
  
  // Interactive feature states
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightData | null>(null);

  // Audio & Speech States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState<boolean>(false);
  const [isPausedTTS, setIsPausedTTS] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(settings.speechRate || 1.0);
  const speechRecognizerRef = useRef<SpeechRecognitionWrapper | null>(null);

  // Swap animation trigger
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Auto-translate debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sourceLang = getLanguageByCode(sourceLangCode);
  const targetLang = getLanguageByCode(targetLangCode);
  const detectedLang = detectedLangCode ? getLanguageByCode(detectedLangCode) : undefined;

  // Execute translation
  const performTranslation = useCallback(async (textToTranslate: string, sLang: string, tLang: string) => {
    if (!textToTranslate || !textToTranslate.trim()) {
      setTranslatedText('');
      setInsights(null);
      setErrorMsg(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res: TranslationResult = await apiService.translate({
        text: textToTranslate,
        sourceLang: sLang,
        targetLang: tLang,
        provider: settings.preferredProvider,
      });

      setTranslatedText(res.translatedText);
      if (res.detectedSourceLanguage) {
        setDetectedLangCode(res.detectedSourceLanguage);
      }
      if (res.detectedLanguageName) {
        setDetectedLangName(res.detectedLanguageName);
      }

      if (settings.soundEffects) {
        soundFX.playTranslateSuccess();
      }

      // Record to history
      const savedItem = storageService.addHistory({
        originalText: textToTranslate,
        translatedText: res.translatedText,
        sourceLang: sLang === 'auto' ? (res.detectedSourceLanguage || 'en') : sLang,
        targetLang: tLang,
        isFavorite: false,
        provider: res.provider,
        confidence: res.confidence,
      });
      setCurrentHistoryId(savedItem.id);
      setIsFavorite(false);

      // Fetch AI translation insights in background
      apiService.getInsights(
        textToTranslate,
        res.translatedText,
        sLang === 'auto' ? (res.detectedSourceLanguage || 'en') : sLang,
        tLang
      ).then((ins) => {
        setInsights(ins);
      }).catch((e) => console.warn('Insights error:', e));

    } catch (err: any) {
      console.error('Translation error:', err);
      setErrorMsg(err.message || 'Unable to complete translation. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [settings.preferredProvider, settings.soundEffects]);

  // Debounced translation when typing
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!sourceText.trim()) {
      setTranslatedText('');
      setInsights(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performTranslation(sourceText, sourceLangCode, targetLangCode);
    }, 600);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [sourceText, sourceLangCode, targetLangCode, performTranslation]);

  // Swap Languages
  const handleSwapLanguages = () => {
    if (sourceLangCode === 'auto') {
      if (detectedLangCode) {
        setSourceLangCode(targetLangCode);
        setTargetLangCode(detectedLangCode);
      } else {
        onShowToast('Select a specific source language before swapping', '', 'info');
        return;
      }
    } else {
      setSourceLangCode(targetLangCode);
      setTargetLangCode(sourceLangCode);
    }

    // Swap texts
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }

    setIsSwapping(true);
    if (settings.soundEffects) soundFX.playSwap();
    setTimeout(() => setIsSwapping(false), 300);
  };

  // Copy Translated Text
  const handleCopy = (textToCopy?: string) => {
    const text = textToCopy || translatedText;
    if (!text) return;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    if (settings.soundEffects) soundFX.playCopy();
    onShowToast('Copied to clipboard', 'Translation ready to paste', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Clear Input
  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setInsights(null);
    setErrorMsg(null);
    ttsService.stop();
    setIsPlayingTTS(false);
  };

  // Paste from Clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
        onShowToast('Pasted from clipboard', '', 'info');
      }
    } catch {
      onShowToast('Clipboard permission needed', 'Paste using Ctrl+V or Cmd+V', 'warning');
    }
  };

  // Download Translation as TXT
  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linguaflow-${sourceLangCode}-to-${targetLangCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Translation downloaded', `Saved as .txt`, 'success');
  };

  // Share Translation
  const handleShare = async () => {
    if (!translatedText) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LinguaFlow AI Translation',
          text: `${sourceText}\n\n➔ ${translatedText}`,
        });
      } catch {
        // Share dismissed
      }
    } else {
      handleCopy();
      onShowToast('Share content copied to clipboard', '', 'info');
    }
  };

  // Favorite toggle
  const handleToggleFavorite = () => {
    if (!currentHistoryId) {
      if (sourceText && translatedText) {
        const item = storageService.addHistory({
          originalText: sourceText,
          translatedText: translatedText,
          sourceLang: sourceLangCode === 'auto' ? (detectedLangCode || 'en') : sourceLangCode,
          targetLang: targetLangCode,
          isFavorite: true,
          provider: 'user',
        });
        setCurrentHistoryId(item.id);
        setIsFavorite(true);
        onShowToast('Saved to Favorites', '', 'success');
      }
      return;
    }
    const newStatus = storageService.toggleFavorite(currentHistoryId);
    setIsFavorite(newStatus);
    onShowToast(newStatus ? 'Added to Favorites' : 'Removed from Favorites', '', 'info');
  };

  // Speech Recognition (Microphone input)
  const toggleRecording = () => {
    if (isRecording) {
      speechRecognizerRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const langForMic = sourceLangCode === 'auto' ? (detectedLangCode || 'en') : sourceLangCode;
    const recognizer = createSpeechRecognizer(langForMic);
    speechRecognizerRef.current = recognizer;

    const started = recognizer.start(
      (transcript, isFinal) => {
        setSourceText((prev) => (isFinal ? (prev ? prev + ' ' + transcript : transcript) : prev ? prev : transcript));
      },
      () => {
        setIsRecording(false);
      },
      (err) => {
        setIsRecording(false);
        onShowToast('Microphone notice', err, 'warning');
      }
    );

    if (started) {
      setIsRecording(true);
      onShowToast('Listening...', 'Speak now in your source language', 'info');
    }
  };

  // Text-To-Speech Playback
  const handleTTSPlay = () => {
    if (!translatedText) return;

    if (isPausedTTS) {
      ttsService.resume();
      setIsPausedTTS(false);
      setIsPlayingTTS(true);
      return;
    }

    if (isPlayingTTS) {
      ttsService.pause();
      setIsPausedTTS(true);
      setIsPlayingTTS(false);
      return;
    }

    setIsPlayingTTS(true);
    setIsPausedTTS(false);

    ttsService.speak({
      text: translatedText,
      langCode: targetLangCode,
      rate: speechSpeed,
      onEnd: () => {
        setIsPlayingTTS(false);
        setIsPausedTTS(false);
      },
      onError: (err) => {
        setIsPlayingTTS(false);
        setIsPausedTTS(false);
        console.warn('TTS playback error:', err);
      },
    });
  };

  const handleTTSStop = () => {
    ttsService.stop();
    setIsPlayingTTS(false);
    setIsPausedTTS(false);
  };

  // Drag and Drop text file upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
        const text = await file.text();
        setSourceText(text);
        onShowToast('File loaded', file.name, 'success');
      } else {
        onShowToast('Unsupported file type', 'Please drag a .txt, .md, or .json file', 'warning');
      }
    }
  };

  // Sample phrases to try
  const samplePhrases = [
    { label: 'Hello & Welcome', text: 'Welcome to LinguaFlow! Translate text, voice, and documents instantly with AI.' },
    { label: 'Break Barriers', text: 'Break language barriers with AI. Empowering global communication without limits.' },
    { label: 'Thank You', text: 'Thank you very much for your kind support and collaboration.' },
    { label: 'Travel Greeting', text: 'Excuse me, could you please recommend a great local restaurant nearby?' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      
      {/* Central Translation Console Container */}
      <div className="relative rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-slate-800 shadow-2xl shadow-cyan-950/20 p-4 sm:p-7">
        
        {/* Top Control Bar: Language Selectors + Swap */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
          
          {/* Source Language Selector */}
          <div className="w-full sm:w-auto flex-1">
            <LanguageSelector
              label="Translate from"
              value={sourceLangCode}
              onChange={(code) => setSourceLangCode(code)}
              allowAutoDetect={true}
              detectedLanguageCode={detectedLangCode}
            />
          </div>

          {/* Large Animated Swap Button */}
          <div className="shrink-0 flex items-center justify-center">
            <button
              onClick={handleSwapLanguages}
              title="Swap Languages (Ctrl+Shift+S)"
              className={`p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 shadow-lg shadow-cyan-950/40 transition-all duration-300 active:scale-95 group ${
                isSwapping ? 'rotate-180 text-cyan-400 border-cyan-400' : ''
              }`}
              aria-label="Swap source and target languages"
            >
              <ArrowLeftRight className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>

          {/* Target Language Selector */}
          <div className="w-full sm:w-auto flex-1">
            <LanguageSelector
              label="Translate to"
              value={targetLangCode}
              onChange={(code) => setTargetLangCode(code)}
              allowAutoDetect={false}
            />
          </div>
        </div>

        {/* Workspace Dual Panel (Source & Target) */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* LEFT PANEL: Input Text Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col justify-between rounded-2xl bg-slate-950/80 border transition-all duration-200 min-h-[320px] sm:min-h-[380px] p-4 sm:p-5 ${
              isDragging 
                ? 'border-cyan-400 ring-2 ring-cyan-400/20 bg-cyan-950/20' 
                : 'border-slate-800/90 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30'
            }`}
          >
            {/* Source Header Info */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">{sourceLang.name}</span>
                {sourceLangCode === 'auto' && detectedLangName && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">
                    <Sparkles className="w-3 h-3" />
                    Detected: {detectedLangName}
                  </span>
                )}
              </div>

              {/* Character and Word Count */}
              <div className="text-[11px] font-mono text-slate-500">
                <span>{sourceText.length}</span>
                <span className="opacity-50"> / 5000 chars</span>
              </div>
            </div>

            {/* Input Text Area */}
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value.slice(0, 5000))}
              dir={sourceLang.rtl ? 'rtl' : 'ltr'}
              placeholder="Type, paste text, drag a text document here, or tap the microphone to speak..."
              className="w-full flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-base sm:text-lg resize-none focus:outline-none leading-relaxed font-normal min-h-[180px]"
            />

            {/* Microphone Recording Visualizer Banner */}
            {isRecording && (
              <div className="mb-3 p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between text-xs text-cyan-300 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-semibold">Recording speech in {sourceLang.name}...</span>
                </div>
                <button
                  onClick={toggleRecording}
                  className="px-2 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-[11px]"
                >
                  Done
                </button>
              </div>
            )}

            {/* Left Panel Bottom Action Bar */}
            <div className="pt-3 border-t border-slate-900/90 flex flex-wrap items-center justify-between gap-2">
              {/* Left quick actions */}
              <div className="flex items-center gap-1.5">
                {/* Microphone Button */}
                <button
                  onClick={toggleRecording}
                  title={isRecording ? 'Stop Recording' : 'Voice Input (Microphone)'}
                  className={`p-2.5 rounded-xl transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800'
                  }`}
                  aria-label="Voice input speech to text"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Paste Button */}
                <button
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                  aria-label="Paste from clipboard"
                >
                  <Clipboard className="w-4 h-4" />
                </button>

                {/* Clear Button */}
                {sourceText && (
                  <button
                    onClick={handleClear}
                    title="Clear input (Esc)"
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                    aria-label="Clear text"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sample phrases quick-pick dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Sample Phrases</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Hover dropdown list */}
                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block w-64 p-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl z-30">
                  <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase">Try a sample phrase</div>
                  {samplePhrases.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSourceText(sample.text)}
                      className="w-full text-left p-2 rounded-lg text-xs text-slate-300 hover:bg-slate-900 hover:text-cyan-300 transition-colors"
                    >
                      <div className="font-semibold">{sample.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{sample.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Translated Output Area */}
          <div className="relative flex flex-col justify-between rounded-2xl bg-slate-950/80 border border-slate-800/90 min-h-[320px] sm:min-h-[380px] p-4 sm:p-5">
            
            {/* Target Header Info */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{targetLang.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({targetLang.script})</span>
              </div>

              {/* Translation State Indicator */}
              <div className="flex items-center gap-1.5">
                {isLoading && (
                  <span className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Neural Translating...
                  </span>
                )}
              </div>
            </div>

            {/* Error Message if present */}
            {errorMsg ? (
              <div className="my-auto p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-rose-200">Translation Notice</h5>
                    <p className="mt-1 leading-relaxed text-rose-300">{errorMsg}</p>
                    <button
                      onClick={() => performTranslation(sourceText, sourceLangCode, targetLangCode)}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 font-semibold text-xs border border-rose-500/40 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Translation</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Output Display Area */
              <div className="flex-1 overflow-y-auto min-h-[180px]">
                {isLoading ? (
                  /* Animated Glowing Skeleton Loading */
                  <div className="space-y-3 pt-2">
                    <div className="h-5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-md animate-pulse w-3/4" />
                    <div className="h-5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-md animate-pulse w-5/6" />
                    <div className="h-5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-md animate-pulse w-1/2" />
                  </div>
                ) : translatedText ? (
                  <p 
                    dir={targetLang.rtl ? 'rtl' : 'ltr'} 
                    className="text-slate-100 text-base sm:text-lg leading-relaxed font-normal select-text"
                  >
                    {translatedText}
                  </p>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-slate-600 text-sm">
                    Translation will appear here in real-time
                  </div>
                )}
              </div>
            )}

            {/* Audio Waveform Animation while TTS Playing */}
            {isPlayingTTS && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-1 h-4">
                    <span className="w-1 bg-cyan-400 rounded animate-bounce" style={{ height: '100%', animationDelay: '0.1s' }} />
                    <span className="w-1 bg-indigo-400 rounded animate-bounce" style={{ height: '70%', animationDelay: '0.3s' }} />
                    <span className="w-1 bg-fuchsia-400 rounded animate-bounce" style={{ height: '90%', animationDelay: '0.2s' }} />
                    <span className="w-1 bg-cyan-300 rounded animate-bounce" style={{ height: '60%', animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-xs font-semibold text-cyan-300">Reading in {targetLang.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleTTSPlay}
                    className="p-1 rounded text-slate-300 hover:text-white"
                    title={isPausedTTS ? 'Resume' : 'Pause'}
                  >
                    {isPausedTTS ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleTTSStop}
                    className="p-1 rounded text-slate-300 hover:text-rose-400"
                    title="Stop audio"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Right Panel Bottom Action Bar */}
            <div className="pt-3 border-t border-slate-900/90 flex flex-wrap items-center justify-between gap-2">
              {/* Left action buttons */}
              <div className="flex items-center gap-1.5">
                {/* Text-To-Speech Play Button */}
                <button
                  onClick={handleTTSPlay}
                  disabled={!translatedText}
                  title="Listen to translation (Text-To-Speech)"
                  className={`p-2.5 rounded-xl transition-colors disabled:opacity-30 ${
                    isPlayingTTS
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800'
                  }`}
                  aria-label="Play translated text audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Speech Speed Selector */}
                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] font-medium text-slate-400">
                  <span className="mr-1 text-[10px] text-slate-500">Speed:</span>
                  {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSpeechSpeed(speed)}
                      className={`px-1 rounded transition-colors ${
                        speechSpeed === speed ? 'text-cyan-400 font-bold' : 'hover:text-slate-200'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy()}
                  disabled={!translatedText}
                  title="Copy translation (Ctrl+Shift+C)"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors disabled:opacity-30"
                  aria-label="Copy translated text"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={!translatedText}
                  title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                  className={`p-2.5 rounded-xl border border-slate-800 transition-colors disabled:opacity-30 ${
                    isFavorite
                      ? 'bg-rose-950/70 border-rose-500/40 text-rose-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400'
                  }`}
                  aria-label="Favorite translation"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Right secondary action buttons */}
              <div className="flex items-center gap-1.5">
                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={!translatedText}
                  title="Download as TXT file"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors disabled:opacity-30"
                  aria-label="Download translation text"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  disabled={!translatedText}
                  title="Share translation"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors disabled:opacity-30"
                  aria-label="Share translation"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Translate Trigger Bar (with Keyboard shortcut hint) */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Instant translation active</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl + Enter</kbd> to translate instantly</span>
          </div>

          <button
            onClick={() => performTranslation(sourceText, sourceLangCode, targetLangCode)}
            disabled={isLoading || !sourceText.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-98"
          >
            {isLoading ? (
              <span className="inline-block animate-spin">⟳</span>
            ) : (
              <Zap className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isLoading ? 'Translating...' : 'Translate Now'}</span>
          </button>
        </div>

      </div>

      {/* AI Translation Insights */}
      {translatedText && (
        <AIInsights
          insights={insights}
          detectedLangName={detectedLangName || (detectedLang ? detectedLang.name : undefined)}
          originalText={sourceText}
          translatedText={translatedText}
          targetLang={targetLangCode}
          onApplyNaturalRewrite={(improvedText) => {
            setTranslatedText(improvedText);
            onShowToast('Applied AI natural rewrite', '', 'success');
          }}
          onCopyText={(text) => handleCopy(text)}
        />
      )}

      {/* Linguistic DNA & Typology */}
      <LanguageDNA
        sourceLang={sourceLang}
        targetLang={targetLang}
        detectedLang={detectedLang}
      />

      {/* World Linguistic Map Bridge */}
      <WorldLanguageMap
        sourceLang={sourceLang}
        targetLang={targetLang}
        detectedLang={detectedLang}
      />

    </div>
  );
};
