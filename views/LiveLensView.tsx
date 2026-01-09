
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Camera, X, Volume2, Sparkles, MessageSquare, Headphones, ArrowLeft, Mic, MicOff, CameraOff, Loader2, Info } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../i18n/translations';
import { decode, decodeAudioData } from '../services/geminiService';
import { Button } from '../components/Button';

interface LiveLensViewProps {
  lang: Language;
  onBack: () => void;
}

export const LiveLensView: React.FC<LiveLensViewProps> = ({ lang, onBack }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [outputTranscription, setOutputTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const FRAME_RATE = 1; 
  const JPEG_QUALITY = 0.6;

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Handle stream assignment to video element after it mounts
  useEffect(() => {
    if (isActive && activeStream && videoRef.current) {
      videoRef.current.srcObject = activeStream;
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [isActive, activeStream]);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }

    for (const source of sourcesRef.current) {
      try { source.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();
    
    setIsActive(false);
    setIsConnecting(false);
  }, [activeStream]);

  const startSession = async () => {
    setError(null);
    setIsConnecting(true);
    setOutputTranscription('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      });
      
      setActiveStream(stream);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);

            // Setup Audio Streaming
            const audioSource = inputAudioContextRef.current!.createMediaStreamSource(stream);
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
            audioSource.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            // Setup Video Frame Streaming
            frameIntervalRef.current = window.setInterval(() => {
              if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64Data = (reader.result as string).split(',')[1];
                        sessionPromise.then(session => {
                          session.sendRealtimeInput({
                            media: { data: base64Data, mimeType: 'image/jpeg' }
                          });
                        });
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', JPEG_QUALITY);
                }
              }
            }, 1000 / FRAME_RATE);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setOutputTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
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
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: t.liveLensSystemInstruction
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e: any) {
      console.error(e);
      setError(e.message || t.aiConnectionIssue);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> {t.back}
      </button>

      <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border-4 border-slate-50 relative flex flex-col items-center justify-center overflow-hidden">
        {isActive && (
          <div className="absolute inset-0 z-0 bg-black">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="w-full h-full object-cover"
             />
             <canvas ref={canvasRef} className="hidden" />
             
             {/* Scanning Animation Overlay */}
             <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-500/10 animate-pulse border-b-2 border-blue-400/50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] border-4 border-white/30 rounded-[3rem]">
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                </div>
             </div>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500/20 z-20">
          <div className={`h-full bg-blue-500 transition-all duration-300 ${isActive ? 'w-full animate-pulse shadow-[0_0_15px_#3b82f6]' : 'w-0'}`} />
        </div>

        {isActive ? (
          <div className="absolute bottom-0 inset-x-0 p-8 z-30 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-6">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-[2rem] border-2 border-white shadow-xl min-h-[100px] w-full max-w-2xl flex items-center justify-center text-center animate-fade-in">
               <p className="text-xl md:text-3xl font-black text-blue-700 italic leading-snug">
                 {outputTranscription || t.showSomething}
               </p>
            </div>

            <div className="flex items-center gap-6">
              <Button variant="danger" onClick={stopSession} className="!py-6 !px-12 !rounded-full !text-2xl shadow-2xl ring-4 ring-white/20">
                <CameraOff size={32} className="mr-2" /> {t.stopLiveLens}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-10 z-10 p-8">
            <div className="bg-slate-100 w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center text-slate-400 mx-auto shadow-inner relative group">
              <Camera size={64} className="md:w-24 md:h-24 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-200 animate-spin-slow" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{t.liveLens}</h3>
              <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                {t.liveLensDesc}
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 text-left max-w-md mx-auto flex gap-4">
               <Info className="text-blue-500 shrink-0" />
               <p className="text-sm font-bold text-blue-800 leading-relaxed">
                 Dori will see your camera stream and can talk about objects, text, and codes she identifies.
               </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 border border-red-100 animate-fade-in">
                <X size={20} /> {error}
              </div>
            )}

            <Button 
              onClick={startSession} 
              isLoading={isConnecting}
              className="!py-8 !px-16 !rounded-full !text-3xl shadow-2xl shadow-blue-200 hover:-translate-y-1 transition-transform"
            >
              <Sparkles size={40} className="mr-2" /> {t.startLiveLens}
            </Button>
          </div>
        )}

        {/* Brand Decoration */}
        {!isActive && (
          <div className="absolute -bottom-20 -right-20 opacity-5 pointer-events-none">
             <Sparkles size={400} />
          </div>
        )}
      </div>
    </div>
  );
};
