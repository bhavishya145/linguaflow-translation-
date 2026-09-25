import React, { useState, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Square, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  ArrowRight,
  Radio
} from 'lucide-react';
import { AppSettings } from '../types';
import { getLanguageByCode } from '../constants/languages';
import { LanguageSelector } from './LanguageSelector';
import { apiService } from '../services/apiService';
import { ttsService, createSpeechRecognizer, SpeechRecognitionWrapper, soundFX } from '../services/audioService';

interface VoiceStudioProps {
  settings: AppSettings;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({ settings, onShowToast }) => {
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('ta');

  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [translatedVoiceText, setTranslatedVoiceText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const recognizerRef = useRef<SpeechRecognitionWrapper | null>(null);

  const langSrcObj = getLanguageByCode(sourceLang);
  const langTgtObj = getLanguageByCode(targetLang);

  const toggleListening = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(sourceLang);
    recognizerRef.current = recognizer;

    const started = recognizer.start(
      (transcript, isFinal) => {
        setSpokenTranscript(transcript);
        if (isFinal) {
          handleAutoTranslate(transcript);
          recognizer.stop();
          setIsListening(false);
        }
      },
      () => {
        setIsListening(false);
      },
      (err) => {
        setIsListening(false);
        onShowToast('Voice recognition error', err, 'warning');
      }
    );

    if (started) {
      setIsListening(true);
      onShowToast('Listening for speech...', `Speak in ${langSrcObj.name}`, 'info');
    }
  };

  const handleAutoTranslate = async (text: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const res = await apiService.translate({
        text,
        sourceLang,
        targetLang,
        provider: settings.preferredProvider,
      });

      setTranslatedVoiceText(res.translatedText);
      soundFX.playTranslateSuccess();

      // Play audio automatically in Voice Studio
      setIsPlayingAudio(true);
      ttsService.speak({
        text: res.translatedText,
        langCode: targetLang,
        rate: settings.speechRate || 1.0,
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    } catch (err: any) {
      onShowToast('Voice translation error', err.message, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReplay = () => {
    if (!translatedVoiceText) return;
    setIsPlayingAudio(true);
    ttsService.speak({
      text: translatedVoiceText,
      langCode: targetLang,
      rate: settings.speechRate || 1.0,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>REAL-TIME VOICE BOOTH</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
          Hands-Free Voice Studio
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Speak in your native tongue and hear natural spoken audio translated in real-time
        </p>
      </div>

      {/* Language Selectors */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 max-w-md mx-auto">
        <div className="w-full sm:w-48">
          <LanguageSelector
            label="Spoken Language"
            value={sourceLang}
            onChange={(c) => setSourceLang(c)}
          />
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
        <div className="w-full sm:w-48">
          <LanguageSelector
            label="Target Audio"
            value={targetLang}
            onChange={(c) => setTargetLang(c)}
          />
        </div>
      </div>

      {/* Large Reactive Visualizer & Microphone Booth */}
      <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800 p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        
        {/* Pulsing visualizer rings */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-30" />
              <div className="absolute -inset-4 rounded-full border border-indigo-400/30 animate-pulse" />
              <div className="absolute -inset-8 rounded-full border border-dashed border-cyan-500/20 animate-spin" style={{ animationDuration: '10s' }} />
            </>
          )}

          {/* Core Interactive Mic Button */}
          <button
            onClick={toggleListening}
            className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-rose-500/50 scale-105'
                : 'bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 text-slate-950 shadow-cyan-500/30 hover:scale-105 active:scale-95'
            }`}
            aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
          >
            {isListening ? (
              <>
                <MicOff className="w-9 h-9" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Tap to Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-9 h-9" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Tap to Speak</span>
              </>
            )}
          </button>
        </div>

        {/* Listening / Status text */}
        <div className="mt-8 text-center">
          <p className="text-sm font-semibold text-slate-300">
            {isListening ? (
              <span className="text-cyan-400 animate-pulse">
                Listening to {langSrcObj.name}... Speak naturally
              </span>
            ) : isTranslating ? (
              <span className="text-indigo-400">Translating voice stream...</span>
            ) : (
              <span className="text-slate-400">
                Press the microphone to begin voice translation
              </span>
            )}
          </p>
        </div>

        {/* Live Audio Transcript Display */}
        {(spokenTranscript || translatedVoiceText) && (
          <div className="mt-8 w-full max-w-xl space-y-4">
            {spokenTranscript && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  You Said ({langSrcObj.name}):
                </span>
                <p className="text-sm text-slate-200">{spokenTranscript}</p>
              </div>
            )}

            {translatedVoiceText && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-500/40 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                    Translated Voice Output ({langTgtObj.name}):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReplay}
                      className="p-1 rounded text-cyan-400 hover:text-cyan-200"
                      title="Replay Audio"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(translatedVoiceText);
                        onShowToast('Copied translation', '', 'success');
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-200"
                      title="Copy text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-base font-medium text-slate-100">{translatedVoiceText}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
