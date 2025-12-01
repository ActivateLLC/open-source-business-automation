'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// VAD (Voice Activity Detection) types
interface VADInstance {
  start: () => Promise<void>;
  pause: () => void;
  destroy: () => void;
}

interface VADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audio: Float32Array) => void;
  onVADMisfire?: () => void;
  positiveSpeechThreshold?: number;
  negativeSpeechThreshold?: number;
  minSpeechFrames?: number;
  preSpeechPadFrames?: number;
  redemptionFrames?: number;
  submitUserSpeechOnPause?: boolean;
}

// Web Speech API types for cross-browser support
interface SpeechRecognitionResultItem {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly 0: SpeechRecognitionResultItem;
  item(index: number): SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface WebSpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface WebSpeechRecognitionErrorEvent {
  readonly error: string;
  readonly message?: string;
}

interface WebSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => WebSpeechRecognition;
  webkitSpeechRecognition?: new () => WebSpeechRecognition;
  __speechRecognition?: WebSpeechRecognition;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
  className?: string;
}

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'error';

export function VoiceInput({
  onTranscript,
  isProcessing = false,
  disabled = false,
  className = '',
}: VoiceInputProps) {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [isVadReady, setIsVadReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  
  const vadRef = useRef<VADInstance | null>(null);
  const whisperWorkerRef = useRef<Worker | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize VAD and Whisper
  const initializeVoice = useCallback(async () => {
    try {
      setVoiceStatus('processing');
      setErrorMessage(null);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Dynamic import of VAD library (client-side only)
      const vadModule = await import('@ricky0123/vad-web');
      
      // Initialize VAD with speech detection callbacks
      const vad = await vadModule.MicVAD.new({
        onSpeechStart: () => {
          setIsSpeaking(true);
        },
        onSpeechEnd: async (audio: Float32Array) => {
          setIsSpeaking(false);
          setVoiceStatus('processing');
          
          // Convert Float32Array to WAV format for Whisper
          const wavBlob = float32ArrayToWav(audio, 16000);
          
          // Process with Whisper (simplified - using Web Speech API as fallback)
          await processAudioWithWhisper(wavBlob);
        },
        onVADMisfire: () => {
          // Short utterance detected but not enough to process
          setIsSpeaking(false);
        },
        positiveSpeechThreshold: 0.5,
        negativeSpeechThreshold: 0.35,
        minSpeechFrames: 4,
        preSpeechPadFrames: 1,
        redemptionFrames: 8,
        submitUserSpeechOnPause: true,
      } as VADOptions);

      vadRef.current = vad;
      setIsVadReady(true);
      setVoiceStatus('idle');
    } catch (error) {
      console.error('Failed to initialize voice:', error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to initialize voice input. Please check microphone permissions.'
      );
      setVoiceStatus('error');
    }
  }, []);

  // Convert Float32Array audio to WAV blob
  const float32ArrayToWav = (samples: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    // Audio data
    const floatTo16BitPCM = (sample: number): number => {
      const s = Math.max(-1, Math.min(1, sample));
      return s < 0 ? s * 0x8000 : s * 0x7FFF;
    };
    
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(44 + i * 2, floatTo16BitPCM(samples[i]), true);
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Process audio with Whisper (using Web Speech API as fallback for browser compatibility)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const processAudioWithWhisper = async (_audioBlob: Blob): Promise<void> => {
    try {
      // For browser-based transcription, we'll use the Web Speech API as a reliable fallback
      // In production, Transformers.js with Whisper can be used for offline transcription
      
      // Simulate transcription delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a full implementation, you would:
      // 1. Load Whisper model using Transformers.js
      // 2. Process the audioBlob
      // 3. Return the transcription
      
      setVoiceStatus('listening');
    } catch (error) {
      console.error('Whisper processing error:', error);
      setVoiceStatus('listening');
    }
  };

  // Start listening
  const startListening = async () => {
    if (!isVadReady && !vadRef.current) {
      await initializeVoice();
    }
    
    if (vadRef.current) {
      try {
        await vadRef.current.start();
        setVoiceStatus('listening');
        setTranscribedText('');
      } catch (error) {
        console.error('Failed to start listening:', error);
        setErrorMessage('Failed to start listening');
        setVoiceStatus('error');
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (vadRef.current) {
      vadRef.current.pause();
      setVoiceStatus('idle');
      setIsSpeaking(false);
    }
  };

  // Toggle listening state (kept for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleListening = () => {
    if (voiceStatus === 'listening') {
      stopListening();
    } else if (voiceStatus === 'idle' || voiceStatus === 'error') {
      startListening();
    }
  };

  // Use Web Speech API for real-time transcription (more reliable in browsers)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const windowWithSpeech = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      // Browser doesn't support Web Speech API
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: WebSpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscribedText(finalTranscript);
        onTranscript(finalTranscript);
        setVoiceStatus('idle');
        recognition.stop();
      } else {
        setTranscribedText(interimTranscript);
      }
    };

    recognition.onerror = (event: WebSpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setErrorMessage(`Speech recognition error: ${event.error}`);
        setVoiceStatus('error');
      }
    };

    recognition.onend = () => {
      if (voiceStatus === 'listening') {
        // Restart if still in listening mode
        try {
          recognition.start();
        } catch {
          // Already started or other error
        }
      }
    };

    // Store reference for external control
    windowWithSpeech.__speechRecognition = recognition;

    return () => {
      recognition.stop();
    };
  }, [voiceStatus, onTranscript]);

  // Handle voice button click with Web Speech API
  const handleVoiceClick = async () => {
    if (disabled || isProcessing) return;

    const windowWithSpeech = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      setErrorMessage('Voice input is not supported in this browser');
      return;
    }

    if (voiceStatus === 'listening') {
      const recognition = windowWithSpeech.__speechRecognition;
      if (recognition) {
        recognition.stop();
      }
      setVoiceStatus('idle');
      setIsSpeaking(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const recognition = windowWithSpeech.__speechRecognition;
        if (recognition) {
          recognition.start();
          setVoiceStatus('listening');
          setTranscribedText('');
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setErrorMessage('Please allow microphone access to use voice input');
        setVoiceStatus('error');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vadRef.current) {
        vadRef.current.destroy();
      }
      if (whisperWorkerRef.current) {
        whisperWorkerRef.current.terminate();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getStatusText = () => {
    switch (voiceStatus) {
      case 'listening':
        return isSpeaking ? 'Listening...' : 'Say something...';
      case 'processing':
        return 'Processing...';
      case 'error':
        return errorMessage || 'Error';
      default:
        return 'Click to speak';
    }
  };

  const getStatusColor = () => {
    switch (voiceStatus) {
      case 'listening':
        return isSpeaking ? 'text-green-500' : 'text-blue-500';
      case 'processing':
        return 'text-amber-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className={`voice-input-container ${className}`}>
      <button
        onClick={handleVoiceClick}
        disabled={disabled || isProcessing}
        className={`
          relative p-4 rounded-full transition-all duration-300
          ${voiceStatus === 'listening' 
            ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-500/30 scale-110' 
            : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 hover:scale-105'
          }
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          text-white
        `}
        aria-label={voiceStatus === 'listening' ? 'Stop listening' : 'Start voice input'}
      >
        {/* Microphone Icon */}
        {voiceStatus === 'listening' ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
            />
          </svg>
        )}

        {/* Pulsing ring when listening */}
        {voiceStatus === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
            <span className="absolute inset-0 rounded-full animate-pulse bg-red-400 opacity-20" />
          </>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Status text */}
      <div className="mt-2 text-center">
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {/* Transcribed text preview */}
        {transcribedText && voiceStatus === 'listening' && (
          <p className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">
            &quot;{transcribedText}&quot;
          </p>
        )}
      </div>
    </div>
  );
}

// Compact voice button for inline use
export function VoiceButton({
  onTranscript,
  isProcessing = false,
  disabled = false,
}: Omit<VoiceInputProps, 'className'>) {
  const [isListening, setIsListening] = useState(false);

  const handleClick = async () => {
    if (disabled || isProcessing) return;

    const windowWithSpeech = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      console.error('Voice input not supported');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: WebSpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`
        p-2 rounded-xl transition-all duration-200
        ${isListening 
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400'
        }
        ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? (
        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
          />
        </svg>
      )}
    </button>
  );
}
