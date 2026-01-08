
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, Volume2, X, Sparkles, MessageSquare, Headphones, ArrowLeft } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../i18n/translations';
import { decode, decodeAudioData } from '../services/geminiService';
import { Button } from '../components/Button';

interface VoiceBuddyViewProps {
  lang: Language;
  onBack: () => void;
}

export const VoiceBuddyView: React.FC<VoiceBuddyViewProps> = ({ lang, onBack }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputTranscription, setInputTranscription] = useState('');
  const [outputTranscription, setOutputTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    for (const source of sourcesRef.current) {
      try { source.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();
    
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    setError(null);
    setIsConnecting(true);
    setInputTranscription('');
    setOutputTranscription('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        // Updated model name to gemini-2.5-flash-native-audio-preview-12-2025 according to the coding guidelines.
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);

            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setOutputTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            } else if (message.serverContent?.inputTranscription) {
              setInputTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
              setInputTranscription('');
              setOutputTranscription('');
            }

            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current!, 24000, 1);
              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current!.destination);
              source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch (e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Live API Error:', e);
            setError(t.aiConnectionIssue);
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are Dori, a patient and friendly AI assistant for seniors. Speak slowly, clearly, and warmly. Help them with anything they ask.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setError(t.aiConnectionIssue);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> {t.back}
      </button>

      <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border-4 border-slate-50 relative flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-20">
          <div className={`h-full bg-blue-500 transition-all duration-300 ${isActive ? 'w-full animate-pulse' : 'w-0'}`} />
        </div>

        {isActive ? (
          <div className="space-y-12 w-full text-center z-10">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 scale-150" />
              <div className="bg-blue-600 w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center text-white shadow-2xl relative">
                <Headphones size={64} className="md:w-24 md:h-24" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-slate-800">{t.activeAISystem}</h3>
              <p className="text-xl text-slate-500 font-bold">{t.showSomething}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 min-h-[120px] flex items-center justify-center">
               <p className="text-xl md:text-2xl font-black text-blue-700 italic">
                 {outputTranscription || inputTranscription || '...'}
               </p>
            </div>

            <Button variant="danger" onClick={stopSession} className="!py-6 !px-12 !rounded-full !text-2xl shadow-xl">
              <MicOff size={32} /> {t.stopLiveChat}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-10 z-10">
            <div className="bg-slate-100 w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center text-slate-400 mx-auto shadow-inner">
              <Mic size={64} className="md:w-24 md:h-24" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-slate-800">{t.voiceBuddy || 'Voice Companion'}</h3>
              <p className="text-xl text-slate-500 font-bold max-w-sm mx-auto">
                {t.voiceBuddyDesc || 'Talk to Dori anytime. Perfect for practicing conversation or asking quick questions.'}
              </p>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 border border-red-100">
                <X size={20} /> {error}
              </div>
            )}
            <Button 
              onClick={startSession} 
              isLoading={isConnecting}
              className="!py-8 !px-16 !rounded-full !text-3xl shadow-2xl shadow-blue-200"
            >
              <Mic size={40} /> {t.startNow}
            </Button>
          </div>
        )}

        <div className="absolute -bottom-10 -right-10 opacity-5">
           <Sparkles size={300} />
        </div>
      </div>
    </div>
  );
};
