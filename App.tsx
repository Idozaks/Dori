
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, UserProgress, LessonCategory, Language } from './types';
import { ChatView } from './views/ChatView';
import { AnalyzeView } from './views/AnalyzeView';
import { LessonHub } from './views/LessonHub';
import { LessonDetailView } from './views/LessonDetailView';
import { getLocalizedLessons } from './data/lessons';
import { UI_STRINGS } from './i18n/translations';
import { Home, MessageCircle, Camera, ChevronRight, BookOpen, GraduationCap, Globe, ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'silversurfer_user_progress';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { 
      completedLessonIds: [], 
      selectedInterests: [], 
      preferredLanguage: 'en' 
    };
  });

  const lang = userProgress.preferredLanguage;
  const t = UI_STRINGS[lang];
  const lessons = getLocalizedLessons(lang);
  const isRTL = lang === 'he' || lang === 'ar';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
  }, [userProgress]);

  // Handle click outside to close the language menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangMenuOpen]);

  const setLanguage = (newLang: Language) => {
    setUserProgress(prev => ({ ...prev, preferredLanguage: newLang }));
    setIsLangMenuOpen(false);
  };

  const handleLessonSelect = (id: string) => {
    setActiveLessonId(id);
    setCurrentView(ViewState.LESSON_DETAIL);
  };

  const handleFinishLesson = (id: string) => {
    setUserProgress(prev => ({
      ...prev,
      completedLessonIds: prev.completedLessonIds.includes(id) 
        ? prev.completedLessonIds 
        : [...prev.completedLessonIds, id]
    }));
    setCurrentView(ViewState.LESSON_HUB);
    setActiveLessonId(null);
  };

  const updateInterests = (interests: LessonCategory[]) => {
    setUserProgress(prev => ({ ...prev, selectedInterests: interests }));
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.CHAT:
        return <ChatView />;
      case ViewState.IMAGE_ANALYZE:
        return <AnalyzeView />;
      case ViewState.LESSON_HUB:
        return (
          <LessonHub 
            onSelectLesson={handleLessonSelect} 
            progress={userProgress}
            onUpdateInterests={updateInterests}
            lang={lang}
          />
        );
      case ViewState.LESSON_DETAIL:
        const lesson = lessons.find(l => l.id === activeLessonId);
        if (!lesson) return null;
        return (
          <LessonDetailView 
            lesson={lesson} 
            onFinish={handleFinishLesson} 
            onBack={() => setCurrentView(ViewState.LESSON_HUB)} 
            lang={lang}
          />
        );
      case ViewState.HOME:
      default:
        return <Dashboard 
          onViewChange={setCurrentView} 
          onLessonSelect={handleLessonSelect}
          progress={userProgress} 
          lang={lang} 
        />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#f0f4f8] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setCurrentView(ViewState.HOME)}
          >
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Dori</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative mr-2" ref={langMenuRef}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${isLangMenuOpen ? 'border-blue-400 bg-white shadow-md' : 'border-slate-200 hover:bg-slate-100'}`}
              >
                <Globe size={18} className={isLangMenuOpen ? 'text-blue-600' : 'text-slate-500'} />
                <span className="text-sm font-black text-slate-700 uppercase tracking-wider">{lang}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden z-[60] min-w-[160px] animate-fade-in origin-top-right">
                  {(['en', 'he', 'es', 'ru', 'ar'] as Language[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`w-full text-left px-5 py-4 text-base font-black hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 ${lang === l ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                    >
                      {l === 'en' && 'English'}
                      {l === 'he' && 'עברית'}
                      {l === 'es' && 'Español'}
                      {l === 'ru' && 'Русский'}
                      {l === 'ar' && 'العربية'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex gap-2">
              <button 
                onClick={() => setCurrentView(ViewState.LESSON_HUB)}
                className={`font-black flex items-center gap-2 py-2 px-5 rounded-xl transition-all active:scale-95 ${currentView === ViewState.LESSON_HUB ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <GraduationCap size={20} />
                <span className="hidden sm:inline text-base">{t.learn}</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-100 mt-auto">
        <div className="container mx-auto px-6 py-8 text-center text-slate-400 font-bold">
          <p>Dori AI - {lang === 'en' ? 'Your companion in the digital world.' : t.welcome}</p>
        </div>
      </footer>
    </div>
  );
}

const Dashboard: React.FC<{ onViewChange: (view: ViewState) => void; onLessonSelect: (id: string) => void; progress: UserProgress; lang: Language }> = ({ onViewChange, onLessonSelect, progress, lang }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  
  const features = [
    {
      id: 'learn',
      title: t.learnCenter,
      desc: t.masterDigital,
      icon: <GraduationCap size={32} className="text-blue-700" />,
      color: 'bg-blue-100 border-blue-300 hover:border-blue-500',
      action: ViewState.LESSON_HUB
    },
    {
      id: 'chat',
      title: t.chat,
      desc: lang === 'en' ? 'Chat with a smart assistant who can help answer any question.' : t.chat,
      icon: <MessageCircle size={32} className="text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
      action: ViewState.CHAT
    },
    {
      id: 'analyze',
      title: t.analyze,
      desc: lang === 'en' ? 'Upload a photo and I will tell you what is inside it.' : t.analyze,
      icon: <Camera size={32} className="text-orange-600" />,
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      action: ViewState.IMAGE_ANALYZE
    }
  ];

  const lessons = getLocalizedLessons(lang);
  const nextStep = lessons.find(l => !progress.completedLessonIds.includes(l.id));

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center py-10">
        <h2 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight leading-tight">{t.welcome}</h2>
        <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed opacity-90">
          {t.tagline}
        </p>
      </div>

      {nextStep && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-2xl transform hover:scale-[1.02] transition-all cursor-pointer border-b-8 border-blue-900" onClick={() => onLessonSelect(nextStep.id)}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <span className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest mb-4">
                {t.continue}
              </span>
              <h3 className="text-3xl md:text-4xl font-black mb-3">{t.nextLesson}: {nextStep.title}</h3>
              <p className="text-blue-100 text-xl opacity-90 leading-relaxed">{nextStep.shortDesc}</p>
            </div>
            <button className="bg-white text-blue-800 px-10 py-5 rounded-2xl font-black text-2xl shadow-xl hover:bg-blue-50 transition-colors flex items-center gap-3">
              {t.startNow}
              {isRTL ? <ChevronRight size={28} className="rotate-180" /> : <ChevronRight size={28} />}
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onViewChange(feature.action)}
            className={`flex items-start p-8 rounded-[2.5rem] border-4 transition-all transform hover:-translate-y-2 hover:shadow-2xl text-left ${feature.color}`}
          >
            <div className={`bg-white p-5 rounded-3xl shadow-lg ${isRTL ? 'ml-6' : 'mr-6'}`}>
              {feature.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-black text-slate-800 mb-4">{feature.title}</h3>
              <p className="text-slate-700 text-xl leading-relaxed mb-6 opacity-80">{feature.desc}</p>
              <div className="flex items-center text-slate-800 font-black text-xl gap-2">
                {t.startNow} {isRTL ? <ChevronRight size={24} className="rotate-180" /> : <ChevronRight size={24} />}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-amber-50 p-10 rounded-[2.5rem] border-4 border-amber-200 mt-12 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <span className="text-4xl">💡</span> {t.tipTitle}
        </h3>
        <p className="text-2xl text-slate-700 leading-relaxed font-medium">
          {lang === 'en' ? '"If you ever feel lost or confused by a website, look for the \'Home\' icon or the logo at the top left. Clicking it will usually take you back to the start where things are familiar!"' : t.tagline}
        </p>
      </div>
    </div>
  );
};

export default App;
