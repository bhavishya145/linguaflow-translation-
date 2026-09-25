// Audio synthesis and speech services (TTS & STT)

class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Futuristic gentle chime on successful translation
  playTranslateSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Dual harmonics
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25); // C6

    osc2.frequency.setValueAtTime(261.63, now); // C4
    osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.2);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Subtle swap sound
  playSwap() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Subtle copy click
  playCopy() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Mic activate chime
  playMicStart() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now);
    osc.frequency.exponentialRampToValueAtTime(493.88, now + 0.1);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }
}

export const soundFX = new SoundFX();

// Browser Text-To-Speech
export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return !!this.synth;
  }

  speak({
    text,
    langCode = 'en',
    rate = 1,
    pitch = 1,
    onStart,
    onEnd,
    onError,
  }: {
    text: string;
    langCode?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }): boolean {
    if (!this.synth) {
      onError?.(new Error('Speech Synthesis not supported in this browser.'));
      return false;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Resolve language locale tag (e.g. 'ta' -> 'ta-IN', 'ja' -> 'ja-JP')
    const localeMap: Record<string, string> = {
      en: 'en-US',
      ta: 'ta-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      it: 'it-IT',
      pt: 'pt-BR',
      ar: 'ar-SA',
      zh: 'zh-CN',
      'zh-TW': 'zh-TW',
      ja: 'ja-JP',
      ko: 'ko-KR',
      ru: 'ru-RU',
      nl: 'nl-NL',
      tr: 'tr-TR',
      vi: 'vi-VN',
      th: 'th-TH',
      id: 'id-ID',
      pl: 'pl-PL',
      sv: 'sv-SE',
      uk: 'uk-UA',
      el: 'el-GR',
      he: 'he-IL',
    };

    const targetLocale = localeMap[langCode] || langCode;
    utterance.lang = targetLocale;
    utterance.rate = Math.min(Math.max(rate, 0.5), 2.0);
    utterance.pitch = Math.min(Math.max(pitch, 0.5), 1.5);

    // Try to find matching voice
    const voices = this.synth.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.toLowerCase() === targetLocale.toLowerCase() || v.lang.startsWith(langCode)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      onError?.(e);
    };

    this.synth.speak(utterance);
    return true;
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isPlaying(): boolean {
    return !!(this.synth && (this.synth.speaking || this.synth.pending) && !this.synth.paused);
  }

  isPaused(): boolean {
    return !!(this.synth && this.synth.paused);
  }
}

export const ttsService = new TextToSpeechService();

// Browser Speech Recognition (STT)
export interface SpeechRecognitionWrapper {
  start: (onResult: (text: string, isFinal: boolean) => void, onEnd: () => void, onError: (err: string) => void) => boolean;
  stop: () => void;
  isSupported: () => boolean;
}

export function createSpeechRecognizer(langCode: string = 'en'): SpeechRecognitionWrapper {
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition
      : null;

  let recognitionInstance: any = null;

  return {
    isSupported: () => !!SpeechRecognition,
    start: (onResult, onEnd, onError) => {
      if (!SpeechRecognition) {
        onError('Speech recognition is not supported in this browser.');
        return false;
      }

      try {
        if (recognitionInstance) {
          recognitionInstance.abort();
        }

        const recognition = new SpeechRecognition();
        recognitionInstance = recognition;

        const localeMap: Record<string, string> = {
          en: 'en-US',
          ta: 'ta-IN',
          hi: 'hi-IN',
          te: 'te-IN',
          ml: 'ml-IN',
          kn: 'kn-IN',
          bn: 'bn-IN',
          mr: 'mr-IN',
          es: 'es-ES',
          fr: 'fr-FR',
          de: 'de-DE',
          it: 'it-IT',
          pt: 'pt-BR',
          ar: 'ar-SA',
          zh: 'zh-CN',
          ja: 'ja-JP',
          ko: 'ko-KR',
          ru: 'ru-RU',
        };

        recognition.lang = localeMap[langCode] || langCode;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          soundFX.playMicStart();
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const combined = finalTranscript || interimTranscript;
          if (combined) {
            onResult(combined, !!finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          onError(event.error === 'not-allowed' ? 'Microphone permission was denied.' : `Speech error: ${event.error}`);
        };

        recognition.onend = () => {
          onEnd();
        };

        recognition.start();
        return true;
      } catch (err: any) {
        onError(err.message || 'Failed to start microphone.');
        return false;
      }
    },
    stop: () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch {
          // ignore
        }
      }
    },
  };
}
