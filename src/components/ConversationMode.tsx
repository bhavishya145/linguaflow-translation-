import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  ArrowLeftRight, 
  Trash2, 
  Sparkles, 
  User, 
  Play, 
  Pause, 
  Check, 
  CornerDownLeft,
  VolumeX
} from 'lucide-react';
import { ConversationMessage, Language, AppSettings } from '../types';
import { getLanguageByCode } from '../constants/languages';
import { LanguageSelector } from './LanguageSelector';
import { apiService } from '../services/apiService';
import { ttsService, createSpeechRecognizer, SpeechRecognitionWrapper, soundFX } from '../services/audioService';

interface ConversationModeProps {
  settings: AppSettings;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export const ConversationMode: React.FC<ConversationModeProps> = ({ settings, onShowToast }) => {
  const [langA, setLangA] = useState<string>('en');
  const [langB, setLangB] = useState<string>('ta');
  
  const [activeSpeaker, setActiveSpeaker] = useState<'A' | 'B' | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'demo-c1',
      speaker: 'A',
      originalText: 'Hello! Nice to meet you. How is your work going today?',
      translatedText: 'வணக்கம்! உங்களை சந்தித்ததில் மகிழ்ச்சி. இன்று உங்கள் வேலை எப்படி போகிறது?',
      sourceLang: 'en',
      targetLang: 'ta',
      timestamp: Date.now() - 1000 * 60 * 3,
    },
    {
      id: 'demo-c2',
      speaker: 'B',
      originalText: 'வணக்கம்! அனைத்தும் சிறப்பாக போகிறது. புதிய செயற்கை நுண்ணறிவு திட்டத்தில் வேலை செய்கிறேன்.',
      translatedText: 'Hello! Everything is going great. I am working on a new Artificial Intelligence project.',
      sourceLang: 'ta',
      targetLang: 'en',
      timestamp: Date.now() - 1000 * 60 * 1,
    },
  ]);

  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const recognizerRef = useRef<SpeechRecognitionWrapper | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const languageA = getLanguageByCode(langA);
  const languageB = getLanguageByCode(langB);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (speaker: 'A' | 'B', textToSend: string) => {
    if (!textToSend.trim() || isTranslating) return;

    const sourceCode = speaker === 'A' ? langA : langB;
    const targetCode = speaker === 'A' ? langB : langA;

    setIsTranslating(true);
    try {
      const res = await apiService.translate({
        text: textToSend,
        sourceLang: sourceCode,
        targetLang: targetCode,
        provider: settings.preferredProvider,
      });

      const newMsg: ConversationMessage = {
        id: 'conv-' + Date.now(),
        speaker,
        originalText: textToSend,
        translatedText: res.translatedText,
        sourceLang: sourceCode,
        targetLang: targetCode,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMsg]);
      if (speaker === 'A') setInputA('');
      if (speaker === 'B') setInputB('');

      soundFX.playTranslateSuccess();

      // Auto play translated speech if enabled
      if (autoSpeak) {
        ttsService.speak({
          text: res.translatedText,
          langCode: targetCode,
          rate: settings.speechRate || 1.0,
        });
      }
    } catch (err: any) {
      onShowToast('Translation failed', err.message, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleMic = (speaker: 'A' | 'B') => {
    if (activeSpeaker === speaker) {
      recognizerRef.current?.stop();
      setActiveSpeaker(null);
      return;
    }

    if (activeSpeaker) {
      recognizerRef.current?.stop();
    }

    const langForMic = speaker === 'A' ? langA : langB;
    const recognizer = createSpeechRecognizer(langForMic);
    recognizerRef.current = recognizer;

    const ok = recognizer.start(
      (transcript, isFinal) => {
        if (speaker === 'A') setInputA(transcript);
        else setInputB(transcript);

        if (isFinal) {
          handleSendMessage(speaker, transcript);
          recognizer.stop();
          setActiveSpeaker(null);
        }
      },
      () => {
        setActiveSpeaker(null);
      },
      (err) => {
        setActiveSpeaker(null);
        onShowToast('Microphone notice', err, 'warning');
      }
    );

    if (ok) {
      setActiveSpeaker(speaker);
      onShowToast(`Listening for Person ${speaker}...`, `Speak in ${speaker === 'A' ? languageA.name : languageB.name}`, 'info');
    }
  };

  const playSpeech = (text: string, langCode: string) => {
    ttsService.speak({
      text,
      langCode,
      rate: settings.speechRate || 1.0,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              Dual-Channel Conversation Studio
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time bilingual dialogue with auto speech recognition and audio synthesis
          </p>
        </div>

        {/* Options */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              autoSpeak
                ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Auto Speak: {autoSpeak ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="mt-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 sm:p-6 shadow-2xl flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm">
              <Sparkles className="w-8 h-8 text-cyan-500/40 mb-2 animate-pulse" />
              <p className="font-semibold text-slate-400">No messages yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Person A or Person B can speak or type below to start the live dialogue
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSpeakerA = msg.speaker === 'A';
              const langSource = getLanguageByCode(msg.sourceLang);
              const langTarget = getLanguageByCode(msg.targetLang);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSpeakerA ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">
                      Person {msg.speaker} ({isSpeakerA ? languageA.name : languageB.name})
                    </span>
                    <span>·</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-lg rounded-2xl p-4 shadow-lg border transition-all ${
                      isSpeakerA
                        ? 'bg-gradient-to-br from-cyan-950/70 to-slate-950 border-cyan-500/30 text-slate-100 rounded-tl-sm'
                        : 'bg-gradient-to-br from-indigo-950/70 to-slate-950 border-indigo-500/30 text-slate-100 rounded-tr-sm'
                    }`}
                  >
                    {/* Original sentence */}
                    <div className="text-xs text-slate-400 border-b border-slate-800/80 pb-2 mb-2 italic">
                      "{msg.originalText}"
                    </div>

                    {/* Translated output */}
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm sm:text-base font-medium leading-relaxed">
                        {msg.translatedText}
                      </p>
                      <button
                        onClick={() => playSpeech(msg.translatedText, msg.targetLang)}
                        className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 shrink-0"
                        title="Play audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Dual Input Console at Bottom */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Person A Terminal */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Person A</span>
              </div>
              <div className="w-40">
                <LanguageSelector
                  label=""
                  value={langA}
                  onChange={(c) => setLangA(c)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('A', inputA)}
                placeholder={`Type in ${languageA.name}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />

              <button
                onClick={() => toggleMic('A')}
                className={`p-2.5 rounded-xl border transition-all ${
                  activeSpeaker === 'A'
                    ? 'bg-rose-500 text-white animate-pulse border-rose-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-800'
                }`}
                title="Microphone input for Person A"
              >
                {activeSpeaker === 'A' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleSendMessage('A', inputA)}
                disabled={!inputA.trim() || isTranslating}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all"
                title="Send"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Person B Terminal */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Person B</span>
              </div>
              <div className="w-40">
                <LanguageSelector
                  label=""
                  value={langB}
                  onChange={(c) => setLangB(c)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('B', inputB)}
                placeholder={`Type in ${languageB.name}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />

              <button
                onClick={() => toggleMic('B')}
                className={`p-2.5 rounded-xl border transition-all ${
                  activeSpeaker === 'B'
                    ? 'bg-rose-500 text-white animate-pulse border-rose-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-indigo-400 border-slate-800'
                }`}
                title="Microphone input for Person B"
              >
                {activeSpeaker === 'B' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleSendMessage('B', inputB)}
                disabled={!inputB.trim() || isTranslating}
                className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-slate-950 font-bold transition-all"
                title="Send"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
