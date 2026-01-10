
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { UI_STRINGS } from '../i18n/translations';
import { Language, UserAccount, ViewState, AccessibilitySettings } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { getLocalizedLessons } from '../data/lessons';
import { 
  Sparkles, BookOpen, Camera, GraduationCap, Globe, ClipboardCheck, 
  Info, Book, X, Volume2, Search, ShieldAlert, Layout, Compass, 
  Eye, HeartHandshake, Mic, MoreHorizontal, Grid, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react'; 
import { Avatar } from '../components/Avatar';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  progress: UserAccount;
  lang: Language;
  onChangeLanguage: () => void;
  accessibility: AccessibilitySettings;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, progress, lang, onChangeLanguage, accessibility }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  const [showAllTools, setShowAllTools] = useState(false);
  const [isPlayingTip, setIsPlayingTip] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return t.morningGreeting;
    if (hours < 18) return t.afternoonGreeting;
    return t.eveningGreeting;
  };

  // Contextual priority logic
  const getContextualTiles = () => {
    const hours = currentTime.getHours();
    // Morning: Learning & Admin Focus
    if (hours < 12) {
      return [
        { view: ViewState.LESSON_HUB, label: t.myLessons, desc: t.masterDigital, icon: <BookOpen size={40} />, color: 'bg-blue-600' },
        { view: ViewState.BUREAUCRACY_TRANSLATOR, label: t.bureaucracyTranslator, desc: t.bureaucracyDesc, icon: <ClipboardCheck size={40} />, color: 'bg-orange-600' }
      ];
    }
    // Afternoon: Creative & Assistance
    if (hours < 18) {
      return [
        { view: ViewState.GRANDCHILD_MODE, label: t.grandchildModeShort, desc: t.grandchildModeDesc, icon: <HeartHandshake size={40} />, color: 'bg-indigo-600' },
        { view: ViewState.IMAGE_ANALYZE, label: t.explainPhotos, desc: t.uploadPhotoToUnderstand, icon: <Camera size={40} />, color: 'bg-slate-700' }
      ];
    }
    // Evening: Chat & Guidance
    return [
      { view: ViewState.CHAT, label: t.askAI, desc: t.chatInitialMessage, icon: <Sparkles size={40} />, color: 'bg-emerald-600' },
      { view: ViewState.DECISION_DASHBOARD, label: t.decisionDashboard, desc: t.decisionDashboardDesc, icon: <Compass size={40} />, color: 'bg-blue-700' }
    ];
  };

  const priorityTiles = getContextualTiles();

  return (
    <div className={`max-w-4xl mx-auto space-y-12 pb-32 pt-10 px-6 ${accessibility.extraLargeText ? 'text-2xl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Zen Hero: The One Question */}
      <section className="text-center space-y-8 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Avatar seed={progress.avatar} className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-2xl" />
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
            {getGreeting()}, <span className="text-blue-600">{progress.name}</span>.<br />
            {t.howCanHelp}
          </h1>
        </div>

        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-blue-500 rounded-[3rem] blur-2xl opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
          <div className="relative bg-white border-4 border-slate-100 rounded-[3rem] p-4 shadow-xl flex items-center gap-4 focus-within:border-blue-500 transition-all">
             <div className="bg-blue-50 p-4 rounded-full text-blue-600">
               <Mic size={32} />
             </div>
             <input 
               type="text" 
               placeholder={t.voiceSearchPlaceholder} 
               className="flex-1 bg-transparent text-xl md:text-2xl font-bold outline-none text-slate-800 placeholder:text-slate-300 py-4"
               onClick={() => onNavigate(ViewState.CHAT)}
             />
             <Button onClick={() => onNavigate(ViewState.CHAT)} className="!rounded-full !w-16 !h-16 !p-0 shadow-lg">
               <Search size={28} />
             </Button>
          </div>
        </div>
      </section>

      {/* Suggested Actions: The Priority Two */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.suggestedForYou}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {priorityTiles.map((tile, i) => (
            <button
              key={i}
              onClick={() => onNavigate(tile.view)}
              className={`relative overflow-hidden p-10 rounded-[3.5rem] text-white text-left shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 group ${tile.color}`}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                {tile.icon}
              </div>
              <div className="relative z-10 space-y-4">
                 <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                    {React.cloneElement(tile.icon as React.ReactElement, { size: 40 })}
                 </div>
                 <h3 className="text-3xl md:text-4xl font-black leading-tight">{tile.label}</h3>
                 <p className="text-xl opacity-90 font-medium leading-relaxed">{tile.desc}</p>
                 <div className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs mt-4">
                    {t.startNow} <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                 </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Progress Glance */}
      <section className="bg-white p-10 rounded-[3rem] border-4 border-slate-50 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <BookOpen size={24} className="text-blue-600" /> {t.overallLearningProgress}
            </h2>
            <span className="text-slate-400 font-black uppercase text-xs tracking-widest">{progress.completedLessonIds.length} / {getLocalizedLessons(lang).length}</span>
          </div>
          <ProgressBar 
            current={progress.completedLessonIds.length} 
            total={getLocalizedLessons(lang).length} 
            label="" 
          />
      </section>

      {/* The Tool Drawer: Show All Tools */}
      <section className="space-y-8">
         <div className="flex flex-col items-center gap-6">
            {!showAllTools && (
               <div className="text-center space-y-2">
                 <h3 className="text-slate-400 font-black uppercase tracking-tighter text-sm opacity-60">Want to see everything else?</h3>
                 <Button 
                    variant="secondary" 
                    onClick={() => setShowAllTools(true)}
                    className="!rounded-full !px-8 !py-4 shadow-md flex items-center gap-3 hover:!bg-blue-50 hover:!border-blue-200 transition-colors group"
                 >
                   <Grid size={24} className="text-blue-600 group-hover:scale-110 transition-transform" /> 
                   <span className="font-black uppercase tracking-widest text-sm">{t.allTools}</span>
                   <ChevronDown size={20} className="text-slate-400" />
                 </Button>
               </div>
            )}
            
            {showAllTools && (
               <div className="w-full bg-slate-50/80 p-10 rounded-[3rem] border-2 border-slate-100 shadow-inner animate-slide-in space-y-10">
                  <div className="flex items-center justify-between px-4">
                     <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Grid size={24} className="text-blue-600" /> {t.allTools}
                     </h3>
                     <button 
                        onClick={() => setShowAllTools(false)}
                        className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500"
                     >
                        <X size={32} />
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MiniTool icon={<Sparkles />} label={t.askAI} color="bg-emerald-500" onClick={() => onNavigate(ViewState.CHAT)} />
                    <MiniTool icon={<Camera />} label={t.explainPhotos} color="bg-slate-700" onClick={() => onNavigate(ViewState.IMAGE_ANALYZE)} />
                    <MiniTool icon={<Compass />} label={t.decisionDashboard} color="bg-blue-700" onClick={() => onNavigate(ViewState.DECISION_DASHBOARD)} />
                    <MiniTool icon={<Layout />} label={t.mirrorWorld} color="bg-indigo-500" onClick={() => onNavigate(ViewState.MIRROR_SANDBOX)} />
                    <MiniTool icon={<Eye />} label={t.liveLens} color="bg-purple-600" onClick={() => onNavigate(ViewState.LIVE_LENS)} />
                    <MiniTool icon={<ClipboardCheck />} label={t.bureaucracyTranslator} color="bg-orange-600" onClick={() => onNavigate(ViewState.BUREAUCRACY_TRANSLATOR)} />
                    <MiniTool icon={<BookOpen />} label={t.myLessons} color="bg-blue-600" onClick={() => onNavigate(ViewState.LESSON_HUB)} />
                    <MiniTool icon={<Info />} label={t.glossaryTitle} color="bg-yellow-600" onClick={() => {}} />
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button variant="ghost" onClick={() => setShowAllTools(false)} className="!text-slate-400 font-black flex items-center gap-2">
                       <ChevronUp size={20} /> {t.close}
                    </Button>
                  </div>
               </div>
            )}
         </div>
      </section>

      {/* Hidden Tip Banner */}
      <div className="opacity-0 h-0 overflow-hidden">
        {/* Keeping accessibility/tip logic accessible for the screen reader if needed, but visually removed for "Zen" */}
        <Button onClick={() => {}} isLoading={isPlayingTip} />
      </div>
    </div>
  );
};

const MiniTool = ({ icon, label, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-white border-2 border-slate-50 hover:border-blue-200 hover:shadow-xl transition-all active:scale-95 group shadow-sm"
  >
    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] ${color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
      {React.cloneElement(icon as React.ReactElement, { size: 32 })}
    </div>
    <span className="text-sm md:text-base font-black text-slate-800 uppercase tracking-tight text-center leading-tight">
      {label}
    </span>
  </button>
);
