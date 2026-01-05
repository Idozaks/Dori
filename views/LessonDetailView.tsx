
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Language, Message, ImageSize, TTSVoiceName, CachedImageMap } from '../types';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Markdown } from '../components/Markdown';
import { UI_STRINGS } from '../i18n/translations';
import { generateImage, generateTextResponse, generateSpeech, decode, decodeAudioData, editImage, analyzeImageContent, generateNanoBananaImage } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { 
  ChevronLeft, ChevronRight, Sparkles, Send, Search, Navigation, Info, Globe, 
  QrCode, FileText, MessageSquare, UserPlus, X, Star, UtensilsCrossed, Coffee, Plus, 
  ShoppingBag, Eye, ThumbsUp, MessageCircle, Heart, Camera, Lock, Mic, MicOff, Video, VideoOff,
  MoreVertical, ExternalLink, CreditCard, Bus, Users, Clock, CheckCircle2, XCircle, Paperclip, Image as ImageIcon, Trash2, Smile, Bot, Wand2, Download, RefreshCw, Volume2, StopCircle, Upload, Wallet,
  Share2, Train, 
  Map as MapIcon, 
  Ticket, Package, Book, MessageCircleMore, Check, MapPin, Pill, Truck, Home, Utensils, Headphones, Gift, Calendar, UserCheck, Phone, ShieldAlert, BookOpen, GraduationCap, Type, Cloud, CheckCircle
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

type SelectedQrActionType = { title: string; content: string } | null;

const LOCAL_SCENES: Record<string, { x: number, y: number, type: 'RESTAURANT' | 'MUSEUM' | 'PACKAGE' | 'BUS' | 'SYNC' }> = {
  "A clean minimalist vector illustration of a restaurant table. In the center, a clear square QR code on a simple stand. Flat design style, vibrant soft colors, white background.": { x: 50, y: 45, type: 'RESTAURANT' },
  "A minimalist graphic illustration of a modern museum ticket scanner. A sleek digital screen showing a QR code. Vector art style, clean lines, pastel colors.": { x: 50, y: 40, type: 'MUSEUM' },
  "A friendly vector illustration of a brown cardboard delivery box with a large clear QR code sticker. Flat design, clean minimalist style, white background.": { x: 50, y: 55, type: 'PACKAGE' },
  "A clean graphic illustration of a city bus interior showing a bright yellow payment pole with a QR code scanner. Vector style, flat design, high contrast.": { x: 50, y: 50, type: 'BUS' },
  "A friendly illustration of a smiling computer and a floating soft blue cloud connected by glowing arrows. High contrast, warm colors, clean vector style.": { x: 50, y: 50, type: 'SYNC' }
};

const LocalGraphicIllustration: React.FC<{ type: 'RESTAURANT' | 'MUSEUM' | 'PACKAGE' | 'BUS' | 'SYNC' }> = ({ type }) => {
  switch (type) {
    case 'SYNC':
      return (
        <svg viewBox="0 0 100 125" className="w-full h-full bg-blue-50">
          <rect x="0" y="0" width="100" height="125" fill="#eff6ff" />
          <path d="M20 90 L80 90 L75 60 L25 60 Z" fill="#3b82f6" />
          <rect x="30" y="65" width="40" height="20" fill="#ffffff" rx="2" />
          <path d="M35 15 a15 15 0 0 1 30 0 a15 15 0 0 1 15 15 a15 15 0 0 1-15 15 h-30 a15 15 0 0 1 0-30" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
          <path d="M50 45 L50 60 M45 55 L50 60 L55 55" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'RESTAURANT':
      return (
        <svg viewBox="0 0 100 125" className="w-full h-full bg-slate-50">
          <rect x="0" y="0" width="100" height="125" fill="#f8fafc" />
          <path d="M10 110 L90 110 L85 40 L15 40 Z" fill="#e2e8f0" opacity="0.5" />
          <rect x="30" y="20" width="40" height="60" fill="#ffffff" rx="4" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="35" y="30" width="30" height="40" fill="#f1f5f9" rx="2" />
          <path d="M40 35 h20 M40 42 h15 M40 49 h20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <rect x="42" y="55" width="16" height="16" fill="#1e293b" rx="1" />
          <rect x="45" y="58" width="10" height="10" fill="white" rx="0.5" />
          <rect x="47" y="60" width="6" height="6" fill="#1e293b" />
        </svg>
      );
    case 'MUSEUM':
      return (
        <svg viewBox="0 0 100 125" className="w-full h-full bg-slate-50">
          <rect x="0" y="0" width="100" height="125" fill="#f1f5f9" />
          <rect x="35" y="80" width="30" height="45" fill="#334155" />
          <path d="M30 80 L70 80 L75 25 L25 25 Z" fill="#475569" />
          <rect x="32" y="32" width="36" height="40" fill="#0f172a" rx="4" />
          <rect x="36" y="36" width="28" height="32" fill="#3b82f6" opacity="0.2" rx="2" />
          <rect x="41" y="43" width="18" height="18" fill="white" rx="1" />
          <rect x="44" y="46" width="12" height="12" fill="#0f172a" />
          <circle cx="50" cy="74" r="2" fill="#ef4444" />
        </svg>
      );
    case 'PACKAGE':
      return (
        <svg viewBox="0 0 100 125" className="w-full h-full bg-slate-50">
          <rect x="0" y="0" width="100" height="125" fill="#f8fafc" />
          <path d="M20 90 L80 90 L85 45 L15 45 Z" fill="#d69e5e" />
          <path d="M15 45 L50 35 L85 45 L50 55 Z" fill="#eab308" opacity="0.3" />
          <rect x="35" y="55" width="30" height="20" fill="#ffffff" rx="2" opacity="0.9" />
          <rect x="42" y="58" width="16" height="14" fill="#1e293b" rx="1" />
          <rect x="45" y="61" width="10" height="8" fill="white" />
        </svg>
      );
    case 'BUS':
      return (
        <svg viewBox="0 0 100 125" className="w-full h-full bg-slate-50">
          <rect x="0" y="0" width="100" height="125" fill="#f1f5f9" />
          <rect x="42" y="0" width="16" height="125" fill="#fbbf24" />
          <rect x="30" y="35" width="40" height="40" fill="#1e293b" rx="6" />
          <rect x="34" y="39" width="32" height="32" fill="#ffffff" rx="4" />
          <rect x="40" y="45" width="20" height="20" fill="#1e293b" rx="1" />
          <rect x="43" y="48" width="14" height="14" fill="white" />
          <rect x="30" y="80" width="40" height="10" fill="#94a3b8" rx="2" />
        </svg>
      );
    default:
      return null;
  }
};

const BirdAssistant: React.FC<{ state?: 'happy' | 'thinking' | 'talking' }> = ({ state = 'happy' }) => (
  <div className="relative w-12 h-12 sm:w-20 sm:h-20 bird-container">
    <style>{`
      .bird-container { animation: float 3s ease-in-out infinite; }
      @keyframes float { 0%, 100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-10px) rotate(-2deg); } }
      .bird-body { background: #f97316; border-radius: 50% 50% 40% 40%; position: relative; width: 100%; height: 100%; box-shadow: inset -4px -4px 0 rgba(0,0,0,0.1); border: 2px solid #7c2d12; }
      .bird-eye { background: #fff; border-radius: 50%; width: 22%; height: 22%; position: absolute; top: 25%; left: 20%; border: 1.5px solid #7c2d12; overflow: hidden; }
      .bird-pupil { background: #000; border-radius: 50%; width: 45%; height: 45%; position: absolute; top: 25%; left: 25%; }
      .bird-eye.right { left: 58%; }
      .bird-beak { background: #fbbf24; width: 26%; height: 18%; border-radius: 0 0 100% 100%; position: absolute; top: 48%; left: 50%; transform: translateX(-50%); border: 1.5px solid #7c2d12; }
      ${state === 'thinking' ? '.bird-eye { height: 3px; margin-top: 4px; } .bird-pupil { display: none; }' : ''}
      ${state === 'talking' ? '.bird-beak { animation: talk 0.3s infinite; } @keyframes talk { 0%, 100% { transform: translateX(-50%) scaleY(1); } 50% { transform: translateX(-50%) scaleY(1.4); } }' : ''}
    `}</style>
    <div className="bird-body">
      <div className="bird-eye"><div className="bird-pupil" /></div>
      <div className="bird-eye right"><div className="bird-pupil" /></div>
      <div className="bird-beak" />
    </div>
  </div>
);

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({ lesson, onFinish, onBack, lang, cachedBackgroundImages, onPreFetchNext }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  const [stepIndex, setStepIndex] = useState(0);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [qrTargetPos, setQrTargetPos] = useState({ x: 50, y: 45 });
  const [pos, setPos] = useState({ x: 50, y: 75 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [localIllustration, setLocalIllustration] = useState<'RESTAURANT' | 'MUSEUM' | 'PACKAGE' | 'BUS' | 'SYNC' | null>(null);
  const [selectedQrAction, setSelectedQrAction] = useState<SelectedQrActionType>(null); 
  const [lessonIsLoading, setLessonIsLoading] = useState(false);
  const [lessonLoadingProgress, setLessonLoadingProgress] = useState(0);
  const [lessonLoadingMessage, setLessonLoadingMessage] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const step = lesson.steps[stepIndex];
  const isLastStep = stepIndex === lesson.steps.length - 1;

  useEffect(() => {
    const backgroundPrompt = step.interactiveData?.backgroundPrompt;
    if (backgroundPrompt && LOCAL_SCENES[backgroundPrompt]) {
      const config = LOCAL_SCENES[backgroundPrompt];
      setLocalIllustration(config.type);
      setQrTargetPos({ x: config.x, y: config.y });
      setBgImage(null);
      return;
    }
    setLocalIllustration(null);
    if (backgroundPrompt) {
      setBgImage(cachedBackgroundImages[backgroundPrompt] || null);
    }
  }, [step, cachedBackgroundImages]);

  const handleNext = () => { 
    if (isLastStep) onFinish(lesson.id); 
    else { 
      setStepIndex(prev => prev + 1); 
      setQrSuccess(false); 
      setSyncSuccess(false);
      setQrTargetPos({ x: 50, y: 50 }); 
      setSelectedQrAction(null); 
    } 
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess(true);
    }, 2000);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
    setPos({ x, y });
    const rad = 15;
    if (step.interactiveType === 'SIMULATED_QR') {
      if (Math.sqrt(Math.pow(x - qrTargetPos.x, 2) + Math.pow(y - qrTargetPos.y, 2)) < rad && !qrSuccess) {
        setQrSuccess(true);
      }
    }
  };

  const renderInteractive = () => {
    if (lessonIsLoading) return <LoadingBar progress={lessonLoadingProgress} message={lessonLoadingMessage} lang={lang} />;
    
    switch (step.interactiveType) {
      case 'SIMULATED_SYNC':
        return (
          <div className="w-full rounded-3xl p-8 bg-blue-50 border-4 border-blue-100 shadow-inner flex flex-col items-center gap-8 min-h-[400px] justify-center text-center">
            {syncSuccess ? (
              <div className="animate-bounce-in flex flex-col items-center gap-6">
                <div className="bg-green-100 p-8 rounded-full text-green-600 shadow-xl border-4 border-white">
                  <CheckCircle size={80} />
                </div>
                <h3 className="text-3xl font-black text-slate-800">{t.syncSuccess}</h3>
              </div>
            ) : syncing ? (
              <div className="flex flex-col items-center gap-8 w-full">
                <div className="relative">
                  <Cloud size={100} className="text-blue-500 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw size={40} className="text-white animate-spin" />
                  </div>
                </div>
                <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-blue-600 animate-[sync-progress_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                </div>
                <p className="text-xl font-black text-blue-600 uppercase tracking-widest">{t.syncingNow}</p>
                <style>{`
                  @keyframes sync-progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                  }
                `}</style>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8">
                <div className="relative">
                   <Cloud size={120} className="text-blue-100" strokeWidth={1} />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Cloud size={60} className="text-blue-600" />
                   </div>
                </div>
                <p className="text-xl font-bold text-slate-600 max-w-sm">{t.cloudStorageDesc}</p>
                <Button onClick={handleSync} className="!py-6 !px-12 !text-2xl !rounded-full shadow-2xl !bg-blue-600">
                  <Cloud className="mr-2" /> {t.syncToCloud}
                </Button>
              </div>
            )}
          </div>
        );
      case 'SIMULATED_QR':
        return (
          <div className="w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden aspect-square md:aspect-[4/5] relative bg-white border-2 border-slate-100 shadow-xl" ref={containerRef} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={handleMove} onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={handleMove} style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', touchAction: 'none' }}>
            {localIllustration && <div className="absolute inset-0 z-0"><LocalGraphicIllustration type={localIllustration === 'SYNC' ? 'SYNC' : localIllustration} /></div>}
            <div className={`absolute w-24 h-24 md:w-36 md:h-36 rounded-2xl md:rounded-[2.5rem] border-4 md:border-8 pointer-events-none transition-all duration-300 z-10 ${qrSuccess ? 'border-green-500 opacity-0' : 'border-blue-500 bg-white/10 shadow-2xl'}`} style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}>
               <div className="bg-white/90 p-3 md:p-5 rounded-xl md:rounded-3xl shadow-xl flex items-center justify-center h-full">
                 <Camera size={32} className="md:w-14 md:h-14 text-blue-500" />
               </div>
            </div>
            {qrSuccess && (
              <div className="absolute inset-x-0 bottom-0 p-4 z-20 animate-fade-in">
                <div className="bg-white/95 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl flex flex-col gap-3 border border-blue-100">
                  <p className="text-xs font-black text-blue-600 text-center uppercase">{t.qrCodeScanned}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {step.interactiveData?.actions?.map((action: any) => (
                      <Button key={action.id} onClick={() => setSelectedQrAction({ title: action.overlayTitle, content: action.overlayContent })} variant="secondary" className="!py-2 !px-2 !text-xs !rounded-xl">
                        <span className="truncate">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 pb-20 px-4 pt-4 md:pt-8">
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:text-blue-600">
          {isRTL ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} {t.backToHub}
        </button>
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border border-blue-100">
          {t.step} {stepIndex + 1} / {lesson.steps.length}
        </span>
      </div>
      
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[4rem] shadow-xl border border-slate-50 relative overflow-hidden">
        <div className="absolute -top-4 -right-2 md:-top-10 md:-right-4 z-30">
          <BirdAssistant state={lessonIsLoading ? 'thinking' : 'talking'} />
        </div>
        
        <div className="mb-6">
          <ProgressBar current={stepIndex + 1} total={lesson.steps.length} label={lesson.title} />
        </div>
        
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-1 md:space-y-3">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">{step.title}</h2>
            <div className="text-base md:text-xl text-slate-500 leading-relaxed font-bold opacity-80">{step.content}</div>
          </div>
          
          <div className="relative z-10">
            {renderInteractive()}
          </div>
        </div>
        
        <div className="mt-8 md:mt-12 flex justify-between items-center pt-6 border-t border-slate-50">
          <Button 
            variant="secondary" 
            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} 
            disabled={stepIndex === 0}
            className="!py-3 !px-4 md:!px-8 !text-sm md:!text-lg !rounded-xl"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />} {t.prev}
          </Button>
          <Button 
            onClick={handleNext}
            className="!py-3 !px-6 md:!px-12 !text-base md:!text-xl !rounded-xl shadow-lg"
          >
            {isLastStep ? t.finish : t.next} {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
