
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewState, UserProgress, UserAccount, LessonCategory, Language, CachedImageMap } from './types';
import { ChatView } from './views/ChatView';
import { AnalyzeView } from './views/AnalyzeView';
import { LessonHub } from './views/LessonHub';
import { LessonDetailView } from './views/LessonDetailView';
import { Dashboard } from './views/Dashboard';
import { LandingView } from './views/LandingView';
import { BureaucracyTranslatorView } from './views/BureaucracyTranslatorView';
import { getLocalizedLessons } from './data/lessons';
import { UI_STRINGS } from './i18n/translations';
import { generateNanoBananaImage } from './services/geminiService';
import { BookOpen, Globe, ChevronDown, Users, Check } from 'lucide-react';

const STORAGE_KEY = 'doriai_multi_user_v2';
const TEMPORARY_LANG_KEY = 'doriai_display_language';

const DEFAULT_ACCOUNTS: UserAccount[] = [
  { id: 'doris-72', name: 'Doris', avatar: 'doris', completedLessonIds: [], selectedInterests: ['INTERNET_SKILLS'], preferredLanguage: 'en' },
  { id: 'solomon-80', name: 'Solomon', avatar: 'solomon', completedLessonIds: [], selectedInterests: ['AI_BASICS'], preferredLanguage: 'he' },
  { id: 'goldie-68', name: 'Goldie', avatar: 'goldie', completedLessonIds: [], selectedInterests: ['INTERNET_SKILLS'], preferredLanguage: 'en' },
  { id: 'victor-75', name: 'Victor', avatar: 'victor', completedLessonIds: [], selectedInterests: ['LIFE_ADMIN'], preferredLanguage: 'en' }
];

function App() {
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { accounts: DEFAULT_ACCOUNTS, currentAccountId: null, isAuthenticated: false };
  });

  const [displayLanguage, setDisplayLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem(TEMPORARY_LANG_KEY);
    return (savedLang as Language) || 'en';
  });

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [cachedBackgroundImages, setCachedBackgroundImages] = useState<CachedImageMap>({});
  const langMenuRef = useRef<HTMLDivElement>(null);

  const activeUser = userProgress.accounts.find(a => a.id === userProgress.currentAccountId);
  const t = UI_STRINGS[displayLanguage];
  const isRTL = displayLanguage === 'he' || displayLanguage === 'ar';
  const lessons = getLocalizedLessons(displayLanguage);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress)); }, [userProgress]);
  useEffect(() => { localStorage.setItem(TEMPORARY_LANG_KEY, displayLanguage); }, [displayLanguage]);

  useEffect(() => {
    if (userProgress.isAuthenticated && activeUser) setCurrentView(ViewState.DASHBOARD);
    else setCurrentView(ViewState.LANDING);
  }, [userProgress.isAuthenticated, userProgress.currentAccountId]);

  const updateImageCache = useCallback(async (prompt: string) => {
    if (cachedBackgroundImages[prompt]) return;
    try {
      const imageUrl = await generateNanoBananaImage(prompt, { lang: displayLanguage });
      setCachedBackgroundImages(prev => ({ ...prev, [prompt]: imageUrl }));
    } catch (e) { console.error(e); }
  }, [displayLanguage, cachedBackgroundImages]);

  const handleLanguageChange = (l: Language) => {
    setDisplayLanguage(l);
    setIsLangMenuOpen(false);
  };

  const handleLogin = (account: UserAccount) => { 
    setUserProgress(prev => ({ 
      ...prev, 
      currentAccountId: account.id, 
      isAuthenticated: true 
    })); 
    setDisplayLanguage(account.preferredLanguage);
  };
  
  const handleSwitchAccount = () => setUserProgress(prev => ({ ...prev, isAuthenticated: false, currentAccountId: null }));
  const handleLogoClick = () => {
    if (userProgress.isAuthenticated) setCurrentView(ViewState.DASHBOARD);
    else setCurrentView(ViewState.LANDING);
  };

  const handleLessonSelect = (id: string) => { setActiveLessonId(id); setCurrentView(ViewState.LESSON_DETAIL); };
  const handleFinishLesson = (id: string) => {
    setUserProgress(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === prev.currentAccountId ? { ...a, completedLessonIds: a.completedLessonIds.includes(id) ? a.completedLessonIds : [...a.completedLessonIds, id] } : a)
    }));
    setCurrentView(ViewState.LESSON_HUB);
    setActiveLessonId(null);
  };

  const updateInterests = (interests: LessonCategory[]) => {
    setUserProgress(prev => ({ ...prev, accounts: prev.accounts.map(a => a.id === prev.currentAccountId ? { ...a, selectedInterests: interests } : a) }));
  };

  const renderContent = () => {
    if (!userProgress.isAuthenticated) return <LandingView lang={displayLanguage} onLogin={handleLogin} accounts={userProgress.accounts} />;
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard onNavigate={(v) => setCurrentView(v)} progress={activeUser!} lang={displayLanguage} onChangeLanguage={() => setIsLangMenuOpen(true)} />;
      case ViewState.CHAT: return <ChatView lang={displayLanguage} />;
      case ViewState.IMAGE_ANALYZE: return <AnalyzeView lang={displayLanguage} />;
      case ViewState.BUREAUCRACY_TRANSLATOR: return <BureaucracyTranslatorView lang={displayLanguage} />;
      case ViewState.LESSON_HUB: return <LessonHub onSelectLesson={handleLessonSelect} progress={activeUser!} onUpdateInterests={updateInterests} lang={displayLanguage} />;
      case ViewState.LESSON_DETAIL:
        const lesson = lessons.find(l => l.id === activeLessonId);
        if (!lesson) return null;
        return <LessonDetailView lesson={lesson} onFinish={handleFinishLesson} onBack={() => setCurrentView(ViewState.LESSON_HUB)} lang={displayLanguage} cachedBackgroundImages={cachedBackgroundImages} onPreFetchNext={updateImageCache} />;
      default: return null;
    }
  };

  const langNames: Record<Language, string> = { en: 'English', he: 'עברית', es: 'Español', ru: 'Русский', ar: 'العربية' };

  return (
    <div className={`min-h-screen flex flex-col bg-[#f8fafc] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-40 border-b border-slate-100">
        <button onClick={handleLogoClick} className="flex items-center gap-3 text-blue-600 font-black text-2xl tracking-tight">
          <BookOpen size={28} /> <span>Dori AI</span>
        </button>
        <div className="flex items-center gap-4">
          {userProgress.isAuthenticated && activeUser && (
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <span className="font-black text-slate-700 text-sm hidden sm:inline">{activeUser.name}</span>
              <button onClick={handleSwitchAccount} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title={t.switchAccount}><Users size={20} /></button>
            </div>
          )}
          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center gap-2 px-4 py-2 rounded-2xl border-2 bg-white text-slate-700 border-slate-100 hover:border-blue-200 shadow-sm font-black text-sm uppercase"><Globe size={18} /> {displayLanguage}</button>
            {isLangMenuOpen && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-in overflow-hidden`}>
                {(['en', 'he'] as Language[]).map((l) => (
                  <button key={l} onClick={() => handleLanguageChange(l)} className={`flex items-center justify-between w-full px-5 py-3 text-base font-black transition-colors ${displayLanguage === l ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <span>{langNames[l]}</span>{displayLanguage === l && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{renderContent()}</main>
    </div>
  );
}

export default App;
