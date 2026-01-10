
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../types';
import { UI_STRINGS } from '../i18n/translations';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Button } from '../components/Button';
import { 
  ArrowLeft, HeartHandshake, Sparkles, Volume2, StopCircle, Mic, MicOff, 
  Settings, Phone, MessageCircle, Camera, Search, AppWindow, User, 
  ChevronRight, Lock, Trash2, Mail, Bell, MapPin, Loader2, RefreshCw
} from 'lucide-react';

interface GrandchildModeViewProps {
  lang: Language;
  onBack: () => void;
}

interface Highlight {
  x: number;
  y: number;
  label: string;
  action?: string;
}

export const GrandchildModeView: React.FC<GrandchildModeViewProps> = ({ lang, onBack }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  
  const [isMagicActive, setIsMagicActive] = useState(false);
  const [currentGoal, setCurrentGoal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [guidance, setGuidance] = useState<string>(t.grandchildInitial);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [simulatedScreen, setSimulatedScreen] = useState<'home' | 'settings' | 'phone' | 'messages' | 'map'>('home');
  const [privacyMode, setPrivacyMode] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const speechRequestIdRef = useRef(0);

  const stopAudio = () => {
    speechRequestIdRef.current++;
    if (currentAudioSourceRef.current) {
      try { currentAudioSourceRef.current.stop(); } catch (e) {}
      currentAudioSourceRef.current.disconnect();
      currentAudioSourceRef.current = null;
    }
    setIsNarrating(false);
    setIsSpeechLoading(false);
  };

  const speakGuidance = async (text: string) => {
    if (!text) return;
    stopAudio();
    const requestId = speechRequestIdRef.current;
    setIsSpeechLoading(true);
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const base64 = await generateSpeech(text, 'Zephyr', { lang });
      
      if (requestId !== speechRequestIdRef.current) return;

      const buffer = await decodeAudioData(decode(base64), audioContextRef.current, 24000, 1);
      
      if (requestId !== speechRequestIdRef.current) return;

      setIsSpeechLoading(false);
      setIsNarrating(true);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        if (requestId === speechRequestIdRef.current) {
          setIsNarrating(false);
        }
      };
      source.start(0);
      currentAudioSourceRef.current = source;
    } catch (e) {
      if (requestId === speechRequestIdRef.current) {
        setIsNarrating(false);
        setIsSpeechLoading(false);
      }
    }
  };

  const handleMagicButton = async () => {
    if (isMagicActive) {
      setIsMagicActive(false);
      stopAudio();
      setHighlights([]);
      return;
    }
    
    setIsMagicActive(true);
    speakGuidance(t.askDoriPrompt);
  };

  const processUserRequest = async (request: string) => {
    setCurrentGoal(request);
    setIsThinking(true);
    setHighlights([]);
    stopAudio();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are Dori in "Grandchild Mode". A senior user just asked: "${request}". 
      Current screen state: "${simulatedScreen}".
      
      Plan a simple 1-step highlight to help them.
      Return JSON:
      {
        "guidance": "Encouraging voice guidance (1 sentence)",
        "highlight": { "x": number(0-100), "y": number(0-100), "label": "Short button name" },
        "nextScreen": "home" | "settings" | "phone" | "messages" | "map",
        "isPrivacy": boolean
      }
      
      Example: If they want to call family, point to the Phone app (approx 20, 80 on home screen).
      Respond in ${lang === 'he' ? 'Hebrew' : 'English'}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              guidance: { type: Type.STRING },
              highlight: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  label: { type: Type.STRING }
                },
                required: ['x', 'y', 'label']
              },
              nextScreen: { type: Type.STRING },
              isPrivacy: { type: Type.BOOLEAN }
            },
            required: ['guidance', 'highlight']
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setGuidance(result.guidance);
      setHighlights([result.highlight]);
      setPrivacyMode(!!result.isPrivacy);
      speakGuidance(result.guidance);
    } catch (e) {
      console.error(e);
      setGuidance(t.aiConnectionIssue);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSimulatedClick = (screen: any) => {
    setSimulatedScreen(screen);
    setHighlights([]);
    setGuidance(t.grandchildSuccess);
    speakGuidance(t.grandchildSuccess);
  };

  const renderSimulatedScreen = () => {
    if (privacyMode) {
      return (
        <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-6">
           <div className="bg-yellow-100 p-6 rounded-full text-yellow-600 animate-pulse">
             <Lock size={64} />
           </div>
           <h3 className="text-2xl font-black text-white">{t.privacyWarning}</h3>
           <Button variant="secondary" onClick={() => setPrivacyMode(false)} className="!rounded-full px-8">
             {t.continue}
           </Button>
        </div>
      );
    }

    switch (simulatedScreen) {
      case 'home':
        return (
          <div className="flex-1 bg-gradient-to-br from-blue-400 to-indigo-600 p-8 grid grid-cols-3 gap-8 content-start pt-16">
            <AppIcon icon={<Phone size={32} />} label="Phone" color="bg-green-500" onClick={() => handleSimulatedClick('phone')} />
            <AppIcon icon={<MessageCircle size={32} />} label="Chat" color="bg-blue-500" onClick={() => handleSimulatedClick('messages')} />
            <AppIcon icon={<Camera size={32} />} label="Camera" color="bg-slate-700" />
            <AppIcon icon={<MapPin size={32} />} label="Maps" color="bg-rose-500" onClick={() => handleSimulatedClick('map')} />
            <AppIcon icon={<Mail size={32} />} label="Mail" color="bg-white text-red-500" />
            <AppIcon icon={<Settings size={32} />} label="Setup" color="bg-slate-400" onClick={() => handleSimulatedClick('settings')} />
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 bg-white p-6 space-y-4">
            <h3 className="text-2xl font-black border-b pb-2 flex items-center gap-2"><Settings /> Settings</h3>
            <div className="space-y-2">
               {['Wi-Fi', 'Bluetooth', 'Display', 'Sound', 'Battery', 'Security'].map(s => (
                 <div key={s} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                    <span className="font-bold text-lg">{s}</span>
                    <ChevronRight size={20} className="text-slate-300" />
                 </div>
               ))}
            </div>
          </div>
        );
      case 'phone':
        return (
          <div className="flex-1 bg-slate-50 flex flex-col">
            <div className="p-10 text-center space-y-4">
               <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600">
                  <User size={48} />
               </div>
               <h3 className="text-3xl font-black">Sarah Bloom</h3>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Daughter</p>
            </div>
            <div className="mt-auto grid grid-cols-1 p-8 gap-4">
               <Button className="!bg-green-600 !py-8 !rounded-full !text-2xl shadow-xl">
                 <Phone size={32} /> Call Sarah
               </Button>
               <Button variant="secondary" className="!py-6 !rounded-full !text-xl" onClick={() => setSimulatedScreen('home')}>
                 End Call
               </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center space-y-4">
             <AppWindow size={64} className="text-slate-300" />
             <p className="font-black text-slate-400 uppercase tracking-widest">{simulatedScreen} App</p>
             <Button variant="secondary" onClick={() => setSimulatedScreen('home')}>{t.back}</Button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        .glowing-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 6px solid #3b82f6;
          box-shadow: 0 0 20px #3b82f6;
          z-index: 50;
          pointer-events: none;
          animation: pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
        .magic-button-glow {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.6), 0 0 50px rgba(59, 130, 246, 0.3);
          animation: magic-float 3s ease-in-out infinite;
        }
        @keyframes magic-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> {t.back}
      </button>

      <div className="flex-1 flex flex-col md:flex-row gap-8">
        {/* Device Simulation Container */}
        <div className="flex-1 bg-slate-900 rounded-[3.5rem] p-4 shadow-2xl border-[12px] border-slate-800 relative flex flex-col overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-slate-800 rounded-b-3xl z-40" />
           
           {renderSimulatedScreen()}

           {/* Over-the-shoulder Guidance Highlights */}
           {highlights.map((h, i) => (
             <div key={i} className="absolute z-50 pointer-events-none" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                <div className="glowing-ring" />
                <div className="glowing-ring [animation-delay:0.5s]" />
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-sm whitespace-nowrap shadow-xl border-2 border-white flex items-center gap-2">
                   <Sparkles size={16} /> {h.label}
                </div>
             </div>
           ))}

           {/* Magic Floating Button */}
           <button 
             onClick={handleMagicButton}
             className={`absolute bottom-8 right-8 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center z-[60] transition-all transform active:scale-90 ${isMagicActive ? 'bg-indigo-600 text-white rotate-12 scale-110' : 'bg-white text-blue-600 hover:scale-105 shadow-xl'} magic-button-glow`}
             title={t.magicButton}
           >
             <HeartHandshake size={isMagicActive ? 40 : 48} />
             {isMagicActive && <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-pulse border-2 border-white" />}
           </button>

           {/* Voice Command Overlay */}
           {isMagicActive && (
             <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full space-y-6">
                   <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-blue-600">
                      {isListening ? <Mic className="animate-pulse" size={48} /> : <Sparkles size={48} />}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-2xl font-black text-slate-800">{isThinking ? t.grandchildThinking : (isListening ? 'Listening...' : t.grandchildModeShort)}</h4>
                      <p className="text-lg font-bold text-slate-500 italic">
                        {isThinking ? '...' : (currentGoal || t.askDoriPrompt)}
                      </p>
                   </div>
                   
                   <div className="flex flex-col gap-3">
                     {!isListening && !isThinking && (
                        <Button 
                           fullWidth 
                           className="!py-6 !text-2xl !rounded-2xl"
                           onClick={() => {
                             setIsListening(true);
                             setTimeout(() => {
                               setIsListening(false);
                               processUserRequest(lang === 'he' ? 'איך אני מתקשר לבת שלי?' : 'How do I call my daughter?');
                             }, 2500);
                           }}
                        >
                          <Mic size={24} /> Start Talking
                        </Button>
                     )}
                     
                     <Button variant="secondary" onClick={() => setIsMagicActive(false)}>
                       Cancel
                     </Button>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Info & Side Panel */}
        <div className="md:w-80 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><HeartHandshake size={32} /></div>
                 <h2 className="text-2xl font-black leading-tight">{t.grandchildMode}</h2>
              </div>
              <p className="text-slate-500 font-bold leading-relaxed mb-6">
                {t.grandchildModeDesc}
              </p>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-3">
                 <Sparkles className="text-blue-500 shrink-0" size={20} />
                 <p className="text-sm font-black text-blue-800 leading-relaxed">
                   Dori stays with you. Just tap her floating bubble whenever you're stuck!
                 </p>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <div className="flex items-center gap-3 mb-4">
                 <Bell className="text-yellow-400" size={24} />
                 <h4 className="text-lg font-black tracking-tight">System Status</h4>
              </div>
              <div className="space-y-4">
                 <StatusItem label="AI Vision" active />
                 <StatusItem label="Accessibility" active />
                 <StatusItem label="Voice Guide" active={isNarrating || isSpeechLoading} />
              </div>
              
              <Button variant="secondary" onClick={resetMode} className="w-full mt-8 !bg-slate-800 !text-white !border-slate-700 !rounded-xl">
                 <RefreshCw size={20} className="mr-2" /> Reset Screen
              </Button>
           </div>
        </div>
      </div>
    </div>
  );

  function resetMode() {
    setSimulatedScreen('home');
    setHighlights([]);
    setGuidance(t.grandchildInitial);
    setCurrentGoal('');
    setPrivacyMode(false);
    stopAudio();
  }
};

const AppIcon = ({ icon, label, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 group transition-all active:scale-90"
  >
    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] ${color} flex items-center justify-center text-white shadow-xl group-hover:-translate-y-1 transition-transform`}>
      {icon}
    </div>
    <span className="text-white font-black text-xs md:text-sm uppercase tracking-widest">{label}</span>
  </button>
);

const StatusItem = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest opacity-80">
    <span>{label}</span>
    <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-slate-600'}`} />
  </div>
);
