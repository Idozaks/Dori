
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Language, Message, ImageSize, TTSVoiceName, CachedImageMap } from '../types';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Markdown } from '../components/Markdown';
import { UI_STRINGS } from '../i18n/translations';
import { generateImage, generateTextResponse, generateSpeech, decode, decodeAudioData, editImage, analyzeImageContent, generateNanoBananaImage } from '../services/geminiService';
import { 
  ChevronLeft, ChevronRight, Sparkles, Send, Search, Navigation, Info, Globe, 
  QrCode, FileText, MessageSquare, UserPlus, X, Star, UtensilsCrossed, Coffee, Plus, 
  ShoppingBag, Eye, ThumbsUp, MessageCircle, Heart, Camera, Lock, Mic, MicOff, Video, VideoOff,
  MoreVertical, ExternalLink, CreditCard, Bus, Users, Clock, CheckCircle2, XCircle, Paperclip, Image as ImageIcon, Trash2, Smile, Bot, Wand2, Download, RefreshCw, Volume2, StopCircle, Upload, Wallet,
  Share2, Train, 
  Map as MapIcon, 
  Ticket, Package, Book, MessageCircleMore, Check, MapPin, Pill, Truck, Home, Utensils, Headphones, Gift, Calendar, UserCheck, Phone, ShieldAlert
} from 'lucide-react';
import { LoadingBar } from '../components/LoadingBar';

interface LessonDetailViewProps {
  lesson: Lesson;
  onFinish: (id: string) => void;
  onBack: () => void;
  lang: Language;
  cachedBackgroundImages: CachedImageMap;
  onPreFetchNext: (prompt: string) => void;
}

const LucideIcons = {
  FileText, Star, Users, Ticket, Package, Book, Share2, Train, Heart, MessageCircleMore, Headphones, Gift, Calendar, UserCheck, Phone, MapIcon, Sparkles, ShieldAlert, Info
};

type SelectedQrAction = {
  title: string;
  content: string;
} | null;

const BirdAssistant: React.FC<{ state?: 'happy' | 'thinking' | 'talking' }> = ({ state = 'happy' }) => (
  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bird-container">
    <style>{`
      .bird-container { animation: float 3s ease-in-out infinite; }
      @keyframes float { 0%, 100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-10px) rotate(-2deg); } }
      .bird-body { background: #f97316; border-radius: 50% 50% 40% 40%; position: relative; width: 100%; height: 100%; box-shadow: inset -8px -8px 0 rgba(0,0,0,0.1); border: 3px solid #7c2d12; }
      .bird-eye { background: #fff; border-radius: 50%; width: 22%; height: 22%; position: absolute; top: 25%; left: 20%; border: 2px solid #7c2d12; overflow: hidden; }
      .bird-pupil { background: #000; border-radius: 50%; width: 45%; height: 45%; position: absolute; top: 25%; left: 25%; }
      .bird-eye.right { left: 58%; }
      .bird-beak { background: #fbbf24; width: 26%; height: 18%; border-radius: 0 0 100% 100%; position: absolute; top: 48%; left: 50%; transform: translateX(-50%); border: 2px solid #7c2d12; }
      ${state === 'thinking' ? '.bird-eye { height: 4px; margin-top: 6px; } .bird-pupil { display: none; }' : ''}
      ${state === 'talking' ? '.bird-beak { animation: talk 0.3s infinite; } @keyframes talk { 0%, 100% { transform: translateX(-50%) scaleY(1); } 50% { transform: translateX(-50%) scaleY(1.4); } }' : ''}
    `}</style>
    <div className="bird-body">
      <div className="bird-eye"><div className="bird-pupil" /></div>
      <div className="bird-eye right"><div className="bird-pupil" /></div>
      <div className="bird-beak" />
    </div>
  </div>
);

const TargetGuideRing: React.FC<{ x: number, y: number, isFound?: boolean, currentPos: {x: number, y: number} }> = ({ x, y, isFound = false, currentPos }) => {
  const dist = Math.sqrt(Math.pow(x - currentPos.x, 2) + Math.pow(y - currentPos.y, 2));
  const isNear = dist < 25;

  return (
    <div 
      className="absolute pointer-events-none transition-all duration-500 z-10" 
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* The Target Box as requested in screenshot */}
      <div className={`
        relative w-28 h-28 sm:w-36 sm:h-36 rounded-[2.5rem] border-8 
        flex items-center justify-center transition-all duration-500
        ${isFound 
          ? 'border-green-500 bg-green-500/10 scale-110' 
          : isNear 
            ? 'border-blue-400 bg-blue-400/20 scale-105 animate-pulse' 
            : 'border-white/40 bg-white/5 shadow-xl'}
      `}>
        {/* Inner circle/dot indicator */}
        <div className={`
          w-4 h-4 rounded-full transition-all duration-300
          ${isFound ? 'bg-green-500 scale-150' : 'bg-white/60 animate-ping'}
        `} />
        
        {/* Helper camera icon inside the target to hint what to do */}
        {!isFound && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Camera size={48} className="text-white" />
          </div>
        )}
      </div>

      {/* Ripple effect */}
      {!isFound && (
        <div className={`absolute inset-0 w-28 h-28 sm:w-36 sm:h-36 rounded-[2.5rem] border-4 border-white/20 scale-125 animate-ping`} />
      )}
    </div>
  );
};

const PharmacyExperience: React.FC<{ lang: Language, onComplete: () => void }> = ({ lang, onComplete }) => {
  const t = UI_STRINGS[lang];
  const [rxNumber, setRxNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'HOME' | null>(null);
  const [ordered, setOrdered] = useState(false);
  const handleOrder = () => { setOrdered(true); setTimeout(() => onComplete(), 1500); };
  return (
    <div className="w-full bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xl space-y-6">
      {!ordered ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-4 bg-pink-50 p-4 rounded-2xl border border-pink-100">
            <div className="bg-pink-500 p-3 rounded-xl text-white shadow-md"><Pill size={24} /></div>
            <div>
              <h4 className="text-lg font-black text-slate-800">{t.pharmacyTitle}</h4>
              <p className="text-sm text-slate-500 font-bold">{t.pharmacyDesc}</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-base font-black text-slate-700">{t.enterRx}</label>
            <input type="text" value={rxNumber} onChange={(e) => setRxNumber(e.target.value)} placeholder={t.rxPlaceholder} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-2xl font-black text-blue-600 focus:border-blue-500 outline-none transition-all shadow-inner" />
          </div>
          <div className="space-y-3">
            <p className="text-base font-black text-slate-700">{t.chooseDelivery}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeliveryMethod('PICKUP')} className={`p-5 rounded-2xl border-4 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'PICKUP' ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'}`}>
                <Users size={28} /><span className="font-black text-sm">{t.pickup}</span>
              </button>
              <button onClick={() => setDeliveryMethod('HOME')} className={`p-5 rounded-2xl border-4 flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'HOME' ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'}`}>
                <Truck size={28} /><span className="font-black text-sm">{t.homeDelivery}</span>
              </button>
            </div>
          </div>
          <Button fullWidth onClick={handleOrder} disabled={!rxNumber || !deliveryMethod} className="!py-5 !text-2xl !rounded-2xl">{t.orderRefill}</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-bounce-in text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 border-2 border-green-50 shadow-inner"><CheckCircle2 size={40} /></div>
          <h3 className="text-2xl font-black text-green-800">{t.refillSuccess}</h3>
          <p className="text-lg text-slate-600 font-medium">{t.refillConfirmation}</p>
        </div>
      )}
    </div>
  );
};

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({ lesson, onFinish, onBack, lang, cachedBackgroundImages, onPreFetchNext }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  const [stepIndex, setStepIndex] = useState(0);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [qrTargetPos, setQrTargetPos] = useState({ x: 50, y: 45 });
  const [pos, setPos] = useState({ x: 50, y: 75 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [selectedQrAction, setSelectedQrAction] = useState<SelectedQrAction>(null); 
  const [lessonIsLoading, setLessonIsLoading] = useState(false);
  const [lessonLoadingProgress, setLessonLoadingProgress] = useState(0);
  const [lessonLoadingMessage, setLessonLoadingMessage] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Message[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [playingAiAudioId, setPlayingAiAudioId] = useState<string | null>(null);
  const [photoJourneyComplete, setPhotoJourneyComplete] = useState(false);
  const [pharmacyComplete, setPharmacyComplete] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapHasResult, setMapHasResult] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [activeLensTarget, setActiveLensTarget] = useState<any>(null);
  const [busQrScanned, setBusQrScanned] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const step = lesson.steps[stepIndex];
  const isLastStep = stepIndex === lesson.steps.length - 1;

  useEffect(() => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    return () => { if (audioContextRef.current) { currentAudioSourceRef.current?.stop(); audioContextRef.current.close(); audioContextRef.current = null; } };
  }, []);

  useEffect(() => {
    const nextStep = lesson.steps[stepIndex + 1];
    const nextPrompt = nextStep?.interactiveData?.backgroundPrompt;
    if (nextPrompt) onPreFetchNext(nextPrompt);
  }, [stepIndex, lesson, onPreFetchNext]);

  useEffect(() => {
    const backgroundPrompt = step.interactiveData?.backgroundPrompt;
    if (backgroundPrompt) {
      const fetchOrGenerateImage = async () => {
        let currentImg = cachedBackgroundImages[backgroundPrompt];
        if (!currentImg) {
          setLessonIsLoading(true);
          setLessonLoadingProgress(0);
          setLessonLoadingMessage(t.startingAI);
          try { 
            currentImg = await generateNanoBananaImage(backgroundPrompt, { 
              lang, 
              onProgress: (p, m) => {
                setLessonLoadingProgress(p);
                setLessonLoadingMessage(m);
              },
            }); 
            setBgImage(currentImg); 
          } 
          catch (e) { console.error(e); } finally { setLessonIsLoading(false); }
        } else { 
          setBgImage(currentImg); 
        }

        if (currentImg && (step.interactiveType === 'SIMULATED_QR' || step.interactiveType === 'SIMULATED_BUS_PAYMENT')) {
          setLessonIsLoading(true); 
          setLessonLoadingMessage(t.analyzingImage);
          try {
            const locPrompt = `Examine this photo closely. Find the SQUARE QR CODE. Return ONLY a JSON object with the coordinates of its EXACT CENTER: {"x": percentage_from_left, "y": percentage_from_top}. Output nothing else.`;
            const result = await analyzeImageContent(currentImg, 'image/png', locPrompt, { 
              lang,
              onProgress: (p, m) => {
                setLessonLoadingProgress(p);
              }
            });
            const jsonMatch = result.match(/\{.*\}/);
            if (jsonMatch) {
              const coords = JSON.parse(jsonMatch[0]);
              setQrTargetPos(coords);
            } else {
              setQrTargetPos({ x: 50, y: 50 });
            }
          } catch (e) { 
            console.error("QR Localization Error:", e);
            setQrTargetPos({ x: 50, y: 50 });
          } finally { setLessonIsLoading(false); }
        }
      };
      fetchOrGenerateImage();
    }
  }, [step, cachedBackgroundImages, lang, t]);

  const handleNext = () => {
    if (isLastStep) onFinish(lesson.id);
    else {
      setStepIndex(prev => prev + 1);
      setQrSuccess(false); setQrTargetPos({ x: 50, y: 50 }); setSelectedQrAction(null); setBgImage(null); setPos({ x: 50, y: 75 }); setAiChatHistory([]); setPhotoJourneyComplete(false); setPharmacyComplete(false); setMapHasResult(false); setQuizCorrect(null); setActiveLensTarget(null); setBusQrScanned(false);
      setLessonLoadingProgress(0);
      if (currentAudioSourceRef.current) { currentAudioSourceRef.current.stop(); setPlayingAiAudioId(null); }
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return; 
    const rect = containerRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } else { clientX = e.clientX; clientY = e.clientY; }
    
    // Convert client coordinates to percentage relative to the interactive container
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
    setPos({ x, y });

    // Detection logic
    const detectionRadius = 20;

    if (step.interactiveType === 'SIMULATED_QR') {
      const distance = Math.sqrt(Math.pow(x - qrTargetPos.x, 2) + Math.pow(y - qrTargetPos.y, 2));
      if (distance < detectionRadius && !qrSuccess) {
        setQrSuccess(true);
        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(50);
      }
    } else if (step.interactiveType === 'SIMULATED_LENS') {
      const targets = step.interactiveData?.targets || [];
      targets.forEach((t: any) => {
        if (Math.sqrt(Math.pow(x - t.x, 2) + Math.pow(y - t.y, 2)) < 12) setActiveLensTarget(t);
      });
    } else if (step.interactiveType === 'SIMULATED_BUS_PAYMENT') {
      const distance = Math.sqrt(Math.pow(x - qrTargetPos.x, 2) + Math.pow(y - qrTargetPos.y, 2));
      if (distance < detectionRadius && !busQrScanned) {
        setBusQrScanned(true);
        if (navigator.vibrate) navigator.vibrate(100);
      }
    }
  };

  const stopAudio = () => { if (currentAudioSourceRef.current) { currentAudioSourceRef.current.stop(); setPlayingAiAudioId(null); } };

  const playTTS = async (id: string, text: string) => {
    if (!audioContextRef.current) return;
    stopAudio(); setPlayingAiAudioId(id); setLessonIsLoading(true); setLessonLoadingMessage(t.generatingSpeech);
    try {
      const b64 = await generateSpeech(text, 'Zephyr', { 
        lang,
        onProgress: (p) => setLessonLoadingProgress(p)
      });
      const buf = await decodeAudioData(decode(b64), audioContextRef.current, 24000, 1);
      const src = audioContextRef.current.createBufferSource();
      src.buffer = buf; src.connect(audioContextRef.current.destination);
      src.onended = () => setPlayingAiAudioId(null); src.start(0); currentAudioSourceRef.current = src;
    } catch (e) { console.error(e); } finally { setLessonIsLoading(false); }
  };

  const handleAiSend = async () => {
    if (!aiChatInput.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: aiChatInput };
    setAiChatHistory(prev => [...prev, userMsg]); setAiChatInput(''); setLessonIsLoading(true); setLessonLoadingMessage(t.thinkingDeeply);
    try {
      const { text: resp } = await generateTextResponse(userMsg.text, false, false, { 
        lang,
        onProgress: (p) => setLessonLoadingProgress(p)
      });
      const aiMsg: Message = { id: (Date.now()+1).toString(), role: 'model', text: resp };
      setAiChatHistory(prev => [...prev, aiMsg]); playTTS(aiMsg.id, resp);
    } catch (e) { console.error(e); } finally { setLessonIsLoading(false); }
  };

  const getIconComponent = (iconName: string): React.ComponentType<any> | undefined => (LucideIcons as any)[iconName];

  const renderQrOverlay = () => {
    if (!selectedQrAction) return null;
    return (
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
        <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden border-4 border-slate-100 flex flex-col">
          <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
            <h4 className="text-xl font-black truncate">{selectedQrAction.title}</h4>
            <button onClick={() => setSelectedQrAction(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={28} /></button>
          </div>
          <div className="p-8 overflow-y-auto max-h-[50vh] text-base"><Markdown content={selectedQrAction.content} /></div>
          <div className="p-6 bg-slate-50 border-t flex justify-center"><Button onClick={() => setSelectedQrAction(null)} className="!py-3 !px-12 !rounded-full !text-sm">{t.close}</Button></div>
        </div>
      </div>
    );
  };

  const renderInteractive = () => {
    if (lessonIsLoading) return <LoadingBar progress={lessonLoadingProgress} message={lessonLoadingMessage} lang={lang} />;
    
    switch (step.interactiveType) {
      case 'SIMULATED_QR':
        return (
          <div 
            className="w-full rounded-[3.5rem] overflow-hidden aspect-[4/5] relative bg-slate-100 flex items-center justify-center border-4 border-slate-200 shadow-2xl cursor-crosshair" 
            ref={containerRef} 
            onMouseDown={() => setIsDragging(true)} 
            onMouseUp={() => setIsDragging(false)} 
            onMouseMove={handleMove} 
            onTouchStart={() => setIsDragging(true)} 
            onTouchEnd={() => setIsDragging(false)} 
            onTouchMove={handleMove} 
            style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', touchAction: 'none' }}
          >
            {/* The Draggable Scanner Viewfinder */}
            <div className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] flex items-center justify-center border-8 pointer-events-none transition-all duration-300 ${qrSuccess ? 'border-green-500 scale-110 opacity-0' : 'border-blue-500 bg-white/10 backdrop-blur-[2px] shadow-2xl'}`} style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="bg-white/90 p-5 rounded-3xl shadow-xl">
                <Camera size={56} className={qrSuccess ? 'text-green-500' : 'text-blue-500'} />
              </div>
            </div>

            {/* The Target Hotspot Indicator */}
            <TargetGuideRing x={qrTargetPos.x} y={qrTargetPos.y} isFound={qrSuccess} currentPos={pos} />

            {qrSuccess && (
              <div className="absolute inset-x-0 bottom-0 p-6 z-20 animate-fade-in">
                  <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl w-full flex flex-col gap-4 border-2 border-blue-50">
                    <p className="text-sm font-black text-blue-600 text-center flex items-center justify-center gap-2 tracking-widest uppercase"><CheckCircle2 size={18} /> {t.qrCodeScanned}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {step.interactiveData?.actions?.map((action: any) => {
                        const Icon = getIconComponent(action.iconName);
                        return <Button key={action.id} onClick={() => setSelectedQrAction({ title: action.overlayTitle, content: action.overlayContent })} variant="secondary" className="!py-4 !px-2 !text-xs !rounded-2xl !border-slate-100 flex flex-col items-center gap-2 shadow-md hover:!border-blue-300 transition-all active:scale-95">{Icon && <Icon size={20} className="text-blue-500" />}<span className="truncate w-full text-center font-black">{action.label}</span></Button>;
                      })}
                    </div>
                  </div>
              </div>
            )}
            {renderQrOverlay()}
          </div>
        );
      case 'SIMULATED_PHOTO_JOURNEY':
        return (
          <div className="w-full bg-slate-100 rounded-[2.5rem] p-8 border-4 border-white shadow-2xl flex flex-col items-center justify-center space-y-6 min-h-[400px]">
            <div className="w-40 h-40 bg-blue-100 rounded-[3rem] flex items-center justify-center border-8 border-white shadow-2xl relative animate-pulse">
              <Camera size={64} className="text-blue-500" />
              {photoJourneyComplete && <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-2 border-4 border-white shadow-lg"><Check size={32} /></div>}
            </div>
            <Button onClick={() => setPhotoJourneyComplete(true)} disabled={photoJourneyComplete} className="!py-5 !px-12 !text-2xl !rounded-full shadow-xl">{photoJourneyComplete ? t.messageSent : t.takePhoto}</Button>
          </div>
        );
      case 'SIMULATED_PHARMACY': return <PharmacyExperience lang={lang} onComplete={() => setPharmacyComplete(true)} />;
      case 'LIVE_AI_CHAT':
        return (
          <div className="space-y-4 flex flex-col h-[450px]">
            <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner">
              {aiChatHistory.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-base shadow-lg ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border-2 border-slate-100 rounded-tl-none'}`}>
                    <Markdown content={m.text} className={m.role === 'user' ? '[&_p]:text-white [&_strong]:text-blue-200' : ''} />
                    {m.role === 'model' && (
                      <button onClick={() => playingAiAudioId === m.id ? stopAudio() : playTTS(m.id, m.text)} className="mt-3 text-blue-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-blue-800 transition-colors">
                        {playingAiAudioId === m.id ? <StopCircle size={16} fill="currentColor" /> : <Volume2 size={16} />}{playingAiAudioId === m.id ? t.stopReading : t.readAloud}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-full border-4 border-slate-100 shadow-xl focus-within:border-blue-500 transition-all">
              <input type="text" placeholder={t.typeMessage} value={aiChatInput} onChange={e => setAiChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} className="flex-1 px-5 text-lg font-medium outline-none" />
              <Button onClick={handleAiSend} disabled={!aiChatInput.trim()} className="!w-14 !h-14 !p-0 !rounded-full shadow-lg"><Send size={24} /></Button>
            </div>
          </div>
        );
      case 'SIMULATED_MAP':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-2 rounded-full border-4 border-slate-100 shadow-xl focus-within:border-blue-500 transition-all">
              <input type="text" value={mapSearch} onChange={e => setMapSearch(e.target.value)} placeholder={step.interactiveData?.searchPlaceholder} className="flex-1 px-5 text-lg font-medium outline-none" />
              <Button onClick={() => setMapHasResult(true)} className="!w-14 !h-14 !p-0 !rounded-full shadow-lg"><Search size={24} /></Button>
            </div>
            <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden border-4 border-slate-100 bg-slate-200 relative shadow-2xl">
               <iframe title="Map" width="100%" height="100%" src={`https://www.google.com/maps?output=embed&q=${encodeURIComponent(mapSearch || 'London')}`}></iframe>
            </div>
          </div>
        );
      case 'SIMULATED_LENS':
        return (
          <div className="w-full rounded-[2.5rem] overflow-hidden aspect-square relative bg-slate-100 flex items-center justify-center border-4 border-slate-200 cursor-crosshair shadow-2xl" ref={containerRef} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={handleMove} onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={handleMove} style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', touchAction: 'none' }}>
            <div className="absolute w-36 h-36 rounded-full border-8 border-white shadow-[0_0_30px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden pointer-events-none transition-transform active:scale-95" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="absolute inset-0 scale-[3]" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: '100% 100%', backgroundPosition: `${pos.x}% ${pos.y}%`, left: `-${pos.x}%`, top: `-${pos.y}%` }} />
            </div>
            {activeLensTarget && (
              <div className="absolute inset-x-0 bottom-8 px-8 animate-bounce-in">
                <div className="bg-white/95 p-4 rounded-3xl shadow-2xl border-2 border-blue-100 text-center"><h4 className="text-lg font-black text-blue-700 uppercase tracking-widest">{activeLensTarget.label}</h4></div>
              </div>
            )}
          </div>
        );
      case 'QUIZ':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight">{step.interactiveData?.question}</h3>
            {step.interactiveData?.options.map((opt: string, i: number) => (
              <Button key={i} fullWidth variant={quizCorrect === null ? 'secondary' : (i === step.interactiveData.correctAnswer ? 'primary' : 'danger')} onClick={() => setQuizCorrect(i === step.interactiveData.correctAnswer)} className="!py-5 !text-lg !rounded-2xl !border-4 shadow-lg transition-all">{opt}</Button>
            ))}
          </div>
        );
      case 'SIMULATED_BUS_PAYMENT':
        return (
          <div className="w-full rounded-[3.5rem] overflow-hidden aspect-square relative bg-slate-100 flex items-center justify-center border-4 border-slate-200 shadow-2xl cursor-grab" ref={containerRef} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={handleMove} onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={handleMove} style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', touchAction: 'none' }}>
             <TargetGuideRing x={qrTargetPos.x} y={qrTargetPos.y} isFound={busQrScanned} currentPos={pos} />
             {!busQrScanned ? (
               <div className="absolute w-32 h-32 rounded-[2.5rem] border-8 border-blue-500 bg-white/20 backdrop-blur-[2px] flex items-center justify-center shadow-2xl" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}>
                 <div className="bg-white p-3 rounded-2xl shadow-lg">
                    <Camera size={48} className="text-blue-500" />
                 </div>
               </div>
             ) : (
               <div className="absolute inset-0 bg-green-500/95 flex flex-col items-center justify-center text-white text-center p-8 animate-fade-in"><CheckCircle2 size={72} className="mb-4" /><h3 className="text-3xl font-black uppercase tracking-widest">{t.ridePaid}</h3><p className="text-xl opacity-90">{t.enjoyJourney}</p></div>
             )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-6 pt-8">
      {/* Header Info Panel */}
      <div className="flex items-center justify-between px-2 mb-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-all hover:translate-x-1">
          {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {t.backToHub}
        </button>
        <div className="flex items-center gap-2">
           <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-sm border border-blue-100">{t.step} {stepIndex + 1} / {lesson.steps.length}</span>
        </div>
      </div>
      
      {/* Main Content Card */}
      <div className="bg-white p-8 sm:p-12 rounded-[4rem] shadow-2xl border-4 border-white relative ring-1 ring-slate-100 overflow-hidden">
        <div className="absolute -top-10 -right-4 sm:-top-12 sm:-right-6 z-30 drop-shadow-2xl"><BirdAssistant state={lessonIsLoading ? 'thinking' : 'talking'} /></div>
        
        <div className="mb-10">
          <ProgressBar current={stepIndex + 1} total={lesson.steps.length} label={lesson.title} />
        </div>

        <div className="mt-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-800 leading-tight tracking-tight">{step.title}</h2>
            <div className="text-2xl text-slate-500 leading-relaxed font-bold opacity-80">{step.content}</div>
          </div>
          
          <div className="relative z-10 mt-10">
            {renderInteractive()}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 flex justify-between gap-6 pt-10 border-t-4 border-slate-50">
          <Button variant="secondary" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0 || lessonIsLoading} className="!py-5 !px-10 !text-xl !rounded-[2rem] !border-4 !border-slate-100 hover:!border-blue-500 transition-all">
            {isRTL ? <ChevronRight size={28} /> : <ChevronLeft size={28} />} {t.prev}
          </Button>
          <Button onClick={handleNext} disabled={ (step.interactiveType === 'SIMULATED_QR' && !qrSuccess) || (step.interactiveType === 'SIMULATED_PHOTO_JOURNEY' && !photoJourneyComplete) || (step.interactiveType === 'SIMULATED_PHARMACY' && !pharmacyComplete) || (step.interactiveType === 'QUIZ' && !quizCorrect) || (step.interactiveType === 'SIMULATED_BUS_PAYMENT' && !busQrScanned) || lessonIsLoading } className="!py-5 !px-14 !text-2xl !rounded-[2rem] shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all">
            {isLastStep ? t.finish : t.next} {isRTL ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-10px) rotate(-2deg); } }
        .bird-container { animation: float 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in-lesson { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-lesson { animation: fade-in-lesson 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}</style>
    </div>
  );
};
