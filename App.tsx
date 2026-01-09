
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewState, UserProgress, UserAccount, LessonCategory, Language, CachedImageMap, AccessibilitySettings } from './types';
import { ChatView } from './views/ChatView';
import { AnalyzeView } from './views/AnalyzeView';
import { LessonHub } from './views/LessonHub';
import { LessonDetailView } from './views/LessonDetailView';
import { Dashboard } from './views/Dashboard';
import { BureaucracyTranslatorView } from './views/BureaucracyTranslatorView';
import { LandingView } from './views/LandingView';
import { MirrorWorldView } from './views/MirrorWorldView'; 
import { LiveLensView } from './views/LiveLensView';
import { getLocalizedLessons } from './data/lessons';
import { UI_STRINGS } from './i18n/translations';
import { generateNanoBananaImage, generateSpeech, decode, decodeAudioData } from './services/geminiService';
import { BookOpen, Globe, Users, Check, Accessibility, X, Volume2, Type, Sun, VolumeX, Sparkles, Layout } from 'lucide-react'; 
import { Button } from './components/Button';

const STORAGE_KEY = 'doriai_multi_user_v2';
const ACCESSIBILITY_KEY = 'doriai_accessibility_v1';

const DEFAULT_ACCOUNTS: UserAccount[] = [
  { id: 'doris-72', name: 'Doris', avatar: 'doris', completedLessonIds: [], selectedInterests: ['INTERNET_SKILLS'], preferredLanguage: 'he' },
  { id: 'solomon-80', name: 'Solomon', avatar: 'solomon', completedLessonIds: [], selectedInterests: ['AI_BASICS'], preferredLanguage: 'he' },
  { id: 'goldie-65', name: 'Goldie', avatar: 'goldie', completedLessonIds: [], selectedInterests: ['INTERNET_SKILLS', 'SAFETY'], preferredLanguage: 'he' },
  { id: 'victor-75', name: 'Victor', avatar: 'victor', completedLessonIds: [], selectedInterests: ['LIFE_ADMIN'], preferredLanguage: 'he' },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>(DEFAULT_ACCOUNTS);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [cachedBackgroundImages, setCachedBackgroundImages] = useState<CachedImageMap>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  
  // Track goal cross-navigation
  const [pendingGoal, setPendingGoal] = useState<string | null>(null);

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    voiceGuidance: false,
    highContrast: false,
    extraLargeText: false
  });

  const activeAccount = accounts.find(a => a.id === currentAccountId) || null;
  const lang = activeAccount?.preferredLanguage || 'he';
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.accounts) setAccounts(parsed.accounts);
      } catch (e) { console.error("Error loading accounts", e); }
    }

    const savedAcc = localStorage.getItem(ACCESSIBILITY_KEY);
    if (savedAcc) {
      try {
        setAccessibility(JSON.parse(savedAcc));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accounts }));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(accessibility));
  }, [accessibility]);

  const speak = async (textKey: keyof typeof t) => {
    if (!accessibility.voiceGuidance) return;
    setIsNarrating(true);
    try {
      const text = t[textKey];
      const audioCtx = new AudioContext({ sampleRate: 24000 });
      const base64 = await generateSpeech(text, 'Zephyr', { lang });
      const buffer = await decodeAudioData(decode(base64), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsNarrating(false);
      source.start(0);
    } catch (e) {
      setIsNarrating(false);
    }
  };

  useEffect(() => {
    if (view === ViewState.DASHBOARD) speak('narratorDashboard');
    else if (view === ViewState.LESSON_HUB) speak('narratorLessons');
    else if (view === ViewState.CHAT) speak('narratorChat');
    else if (view === ViewState.IMAGE_ANALYZE) speak('narratorExplain');
    else if (view === ViewState.MIRROR_SANDBOX) speak('mirrorWorldDesc'); 
    else if (view === ViewState.DECISION_DASHBOARD) speak('decisionDashboardDesc');
    else if (view === ViewState.LIVE_LENS) speak('narratorLiveLens');
  }, [view, accessibility.voiceGuidance]);

  const handleLogin = (account: UserAccount) => {
    setCurrentAccountId(account.id);
    setView(ViewState.DASHBOARD);
  };

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  const handleUpdateInterests = (interests: LessonCategory[]) => {
    if (!currentAccountId) return;
    setAccounts(prev => prev.map(a => 
      a.id === currentAccountId ? { ...a, selectedInterests: interests } : a
    ));
  };

  const handleFinishLesson = (id: string) => {
    if (!currentAccountId) return;
    setAccounts(prev => prev.map(a => {
      if (a.id === currentAccountId) {
        const completed = a.completedLessonIds.includes(id) 
          ? a.completedLessonIds 
          : [...a.completedLessonIds, id];
        return { ...a, completedLessonIds: completed };
      }
      return a;
    }));
    setView(ViewState.LESSON_HUB);
  };

  const toggleLanguage = () => {
    if (!currentAccountId) return;
    const nextLang: Language = lang === 'en' ? 'he' : 'en';
    setAccounts(prev => prev.map(a => 
      a.id === currentAccountId ? { ...a, preferredLanguage: nextLang } : a
    ));
  };

  const toggleAccessibility = (key: keyof AccessibilitySettings) => {
    setAccessibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startGuidedPathFromGoal = (goal: string) => {
    setPendingGoal(goal);
    setView(ViewState.DECISION_DASHBOARD);
  };

  const renderView = () => {
    if (view === ViewState.LANDING) return <LandingView onLogin={handleLogin} lang={lang} accounts={accounts} />;
    if (!activeAccount) return <LandingView onLogin={handleLogin} lang={lang} accounts={accounts} />;

    switch (view) {
      case ViewState.DASHBOARD:
        return <Dashboard onNavigate={handleNavigate} progress={activeAccount} lang={lang} onChangeLanguage={toggleLanguage} accessibility={accessibility} />;
      case ViewState.LESSON_HUB:
        return <LessonHub onSelectLesson={(id) => { setSelectedLessonId(id); setView(ViewState.LESSON_DETAIL); }} progress={activeAccount} onUpdateInterests={handleUpdateInterests} lang={lang} />;
      case ViewState.LESSON_DETAIL:
        const lesson = getLocalizedLessons(lang).find(l => l.id === selectedLessonId);
        return lesson ? (
          <LessonDetailView 
            lesson={lesson} 
            onFinish={handleFinishLesson} 
            onBack={() => setView(ViewState.LESSON_HUB)} 
            lang={lang}
            cachedBackgroundImages={cachedBackgroundImages}
            onPreFetchNext={(p) => {}} 
          />
        ) : null;
      case ViewState.CHAT:
        return <ChatView lang={lang} />;
      case ViewState.IMAGE_ANALYZE:
        return <AnalyzeView lang={lang} />;
      case ViewState.BUREAUCRACY_TRANSLATOR:
        return <BureaucracyTranslatorView lang={lang} onStartGuidedPath={startGuidedPathFromGoal} />;
      case ViewState.MIRROR_SANDBOX:
        return <MirrorWorldView lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.DECISION_DASHBOARD:
        return (
          <MirrorWorldView 
            lang={lang} 
            onBack={() => { setPendingGoal(null); setView(ViewState.DASHBOARD); }} 
            isDecisionDashboard={true} 
            initialGoal={pendingGoal || undefined}
          />
        );
      case ViewState.LIVE_LENS:
        return <LiveLensView lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      default:
        return <Dashboard onNavigate={handleNavigate} progress={activeAccount} lang={lang} onChangeLanguage={toggleLanguage} accessibility={accessibility} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${accessibility.highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'} ${accessibility.extraLargeText ? 'text-2xl' : 'text-base'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {view !== ViewState.LANDING && (
        <header className={`sticky top-0 z-40 w-full border-b-4 transition-all ${accessibility.highContrast ? 'bg-slate-900 border-yellow-400' : 'bg-white/80 backdrop-blur-md border-slate-100'}`}>
          <div className="max-w-7xl mx-auto px-4 h-16 md:h-24 flex items-center justify-between">
            <button 
              onClick={() => handleNavigate(ViewState.DASHBOARD)} 
              className="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-all active:scale-95"
            >
              <div className="bg-blue-600 p-2 md:p-3 rounded-2xl md:rounded-3xl text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <Sparkles size={accessibility.extraLargeText ? 32 : 24} />
              </div>
              <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${accessibility.highContrast ? 'text-yellow-400' : 'text-slate-800'}`}>
                {t.home}
              </h1>
            </button>

            <div className="flex items-center gap-2 md:gap-6">
              <button 
                onClick={toggleLanguage}
                className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-full font-black uppercase tracking-widest text-[10px] md:text-sm border-2 transition-all active:scale-90 ${accessibility.highContrast ? 'bg-slate-800 border-yellow-400 text-yellow-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}
              >
                <Globe size={16} /> {lang === 'en' ? 'Hebrew' : 'English'}
              </button>
              
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-3 md:p-4 rounded-2xl border-2 transition-all active:scale-90 ${accessibility.highContrast ? 'bg-slate-800 border-yellow-400 text-yellow-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {isSidebarOpen ? <X size={24} /> : <Accessibility size={24} />}
              </button>

              <button 
                onClick={() => handleNavigate(ViewState.LANDING)}
                className={`p-3 md:p-4 rounded-2xl border-2 transition-all active:scale-90 ${accessibility.highContrast ? 'bg-slate-800 border-yellow-400 text-yellow-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <Users size={24} />
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 relative">
        {renderView()}
      </main>

      {/* Accessibility Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className={`relative w-full max-w-sm h-full shadow-2xl p-8 flex flex-col space-y-8 animate-slide-in ${accessibility.highContrast ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black">{t.accessibilityMenu}</h2>
               <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-slate-100"><X size={32} /></button>
            </div>
            <p className="font-bold text-slate-500">{t.accessibilityDesc}</p>
            
            <div className="space-y-4">
              <button onClick={() => toggleAccessibility('voiceGuidance')} className={`w-full p-6 rounded-3xl border-4 flex items-center justify-between transition-all ${accessibility.voiceGuidance ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  {accessibility.voiceGuidance ? <Volume2 size={32} /> : <VolumeX size={32} />}
                  <span className="text-xl font-black">{accessibility.voiceGuidance ? t.voiceGuidanceOn : t.voiceGuidanceOff}</span>
                </div>
                {accessibility.voiceGuidance && <Check className="text-blue-600" />}
              </button>

              <button onClick={() => toggleAccessibility('highContrast')} className={`w-full p-6 rounded-3xl border-4 flex items-center justify-between transition-all ${accessibility.highContrast ? 'border-yellow-400 bg-slate-800 text-yellow-400' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <Sun size={32} />
                  <span className="text-xl font-black">{t.highContrast}</span>
                </div>
                {accessibility.highContrast && <Check className="text-yellow-400" />}
              </button>

              <button onClick={() => toggleAccessibility('extraLargeText')} className={`w-full p-6 rounded-3xl border-4 flex items-center justify-between transition-all ${accessibility.extraLargeText ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <Type size={32} />
                  <span className="text-xl font-black">{t.extraLargeText}</span>
                </div>
                {accessibility.extraLargeText && <Check className="text-blue-600" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
