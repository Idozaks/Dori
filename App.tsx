
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewState, UserProgress, UserAccount, LessonCategory, Language, CachedImageMap } from './types';
import { ChatView } from './views/ChatView';
import { AnalyzeView } from './views/AnalyzeView';
import { LessonHub } from './views/LessonHub';
import { LessonDetailView } from './views/LessonDetailView';
import { Dashboard } from './views/Dashboard';
import { LandingView } from './views/LandingView';
import { getLocalizedLessons } from './data/lessons';
import { UI_STRINGS } from './i18n/translations';
import { generateNanoBananaImage } from './services/geminiService';
import { BookOpen, Globe, ChevronDown, Users, Check } from 'lucide-react';

const STORAGE_KEY = 'doriai_multi_user_v1';
const TEMPORARY_LANG_KEY = 'doriai_last_display_language';

const DEFAULT_ACCOUNTS: UserAccount[] = [
  { id: 'doris-72', name: 'Doris', avatar: 'doris', completedLessonIds: ['photo-journey'], selectedInterests: ['INTERNET_SKILLS'], preferredLanguage: 'en' },
  { id: 'solomon-80', name: 'Solomon', avatar: 'solomon', completedLessonIds: ['ai-chat-intro'], selectedInterests: ['AI_BASICS'], preferredLanguage: 'he' },
  { id: 'goldie-68', name: 'Goldie', avatar: 'goldie', completedLessonIds: ['qr-codes'], selectedInterests: ['INTERNET_SKILLS'], preferredLanguage: 'en' }
];

// Seed list for initial warm-up, but look-ahead will handle the rest
const BACKGROUND_IMAGE_PROMPTS = [
  "A high-quality photo of a wooden restaurant table. In the center of the table, there is a prominent square QR code printed on a small acrylic stand.",
  "A photo of a modern museum entrance. A sleek metal pedestal with a glowing scanner screen is visible. The background shows a blurry art gallery.",
  "A photo of a cardboard delivery package sitting on a front porch rug. A large QR code sticker is on the box.",
  "A high-resolution photo of a library book titled 'The Old Man and the Sea'. A library QR sticker is attached to the back cover.",
  "A city bus interior with a yellow payment pole with a QR code.",
  "A vibrant market scene with fresh apples and colorful vegetables.",
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

  const effectiveLanguage = displayLanguage;
  const isRTL = effectiveLanguage === 'he' || effectiveLanguage === 'ar';
  const t = UI_STRINGS[effectiveLanguage];
  const lessons = getLocalizedLessons(effectiveLanguage);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress)); }, [userProgress]);
  useEffect(() => { localStorage.setItem(TEMPORARY_LANG_KEY, effectiveLanguage); }, [effectiveLanguage]);

  // Handle outside clicks for language menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (userProgress.isAuthenticated && activeUser) setCurrentView(ViewState.DASHBOARD);
    else setCurrentView(ViewState.LANDING);
  }, [userProgress.isAuthenticated, userProgress.currentAccountId]);

  // Exposed function for children to populate the cache
  const updateImageCache = useCallback(async (prompt: string) => {
    if (cachedBackgroundImages[prompt]) return;
    try {
      const imageUrl = await generateNanoBananaImage(prompt, { lang: effectiveLanguage });
      setCachedBackgroundImages(prev => ({ ...prev, [prompt]: imageUrl }));
    } catch (e) {
      console.error("Look-ahead pre-generation failed:", e);
    }
  }, [effectiveLanguage, cachedBackgroundImages]);

  useEffect(() => {
    const pregenerateImages = async () => {
      const promises = BACKGROUND_IMAGE_PROMPTS.map(async (prompt) => {
        try { const imageUrl = await generateNanoBananaImage(prompt, { lang: effectiveLanguage }); return { prompt, imageUrl }; }
        catch (e) { return { prompt, imageUrl: null }; }
      });
      const results = await Promise.allSettled(promises);
      const newCache: CachedImageMap = {};
      results.forEach((r) => { if (r.status === 'fulfilled' && r.value.imageUrl) newCache[r.value.prompt] = r.value.imageUrl; });
      setCachedBackgroundImages(prev => ({ ...prev, ...newCache }));
    };
    if (userProgress.isAuthenticated) pregenerateImages();
  }, [effectiveLanguage, userProgress.isAuthenticated]);

  const handleLanguageChange = (l: Language) => {
    setDisplayLanguage(l);
    setIsLangMenuOpen(false);
    if (userProgress.isAuthenticated && userProgress.currentAccountId) {
      setUserProgress(prev => ({
        ...prev,
        accounts: prev.accounts.map(a => a.id === prev.currentAccountId ? { ...a, preferredLanguage: l } : a)
      }));
    }
  };

  const handleLogin = (account: UserAccount) => {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = account.lastLoginDate;
    let newStreak = account.streakCount || 0;

    if (!lastLogin) {
      newStreak = 1;
    } else {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // If diffDays is 0, it means the user logged in again on the same day, keep the current streak.
    }

    setUserProgress(prev => ({
      ...prev,
      currentAccountId: account.id,
      isAuthenticated: true,
      accounts: prev.accounts.map(a => a.id === account.id ? { ...a, lastLoginDate: today, streakCount: newStreak } : a)
    }));
    setDisplayLanguage(account.preferredLanguage);
  };

  const handleSwitchAccount = () => setUserProgress(prev => ({ ...prev, isAuthenticated: false, currentAccountId: null }));
  const handleLessonSelect = (id: string) => { setActiveLessonId(id); setCurrentView(ViewState.LESSON_DETAIL); };

  const handleFinishLesson = (id: string) => {
    setUserProgress(prev => {
      const activeAcc = prev.accounts.find(a => a.id === prev.currentAccountId);
      if (!activeAcc) return prev;

      const newCompleted = activeAcc.completedLessonIds.includes(id)
        ? activeAcc.completedLessonIds
        : [...activeAcc.completedLessonIds, id];

      // Check for badge completion
      const ALL_LESSONS = getLocalizedLessons(effectiveLanguage);
      const lesson = ALL_LESSONS.find(l => l.id === id);
      let newBadges = activeAcc.earnedBadges || [];

      if (lesson) {
        const category = lesson.category;
        const catLessons = ALL_LESSONS.filter(l => l.category === category);
        const isCatComplete = catLessons.every(l => newCompleted.includes(l.id));

        if (isCatComplete && !newBadges.includes(category)) {
          newBadges = [...newBadges, category];
        }
      }

      return {
        ...prev,
        accounts: prev.accounts.map(a => a.id === prev.currentAccountId
          ? { ...a, completedLessonIds: newCompleted, earnedBadges: newBadges }
          : a)
      };
    });
    setCurrentView(ViewState.LESSON_HUB);
    setActiveLessonId(null);
  };

  const updateInterests = (interests: LessonCategory[]) => {
    setUserProgress(prev => ({ ...prev, accounts: prev.accounts.map(a => a.id === prev.currentAccountId ? { ...a, selectedInterests: interests } : a) }));
  };

  const renderContent = () => {
    if (!userProgress.isAuthenticated) return <LandingView lang={effectiveLanguage} onLogin={handleLogin} accounts={userProgress.accounts} />;
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard onNavigateToLessons={() => setCurrentView(ViewState.LESSON_HUB)} onNavigateToChat={() => setCurrentView(ViewState.CHAT)} onNavigateToAnalyze={() => setCurrentView(ViewState.IMAGE_ANALYZE)} progress={activeUser!} lang={effectiveLanguage} onChangeLanguage={() => setIsLangMenuOpen(true)} />;
      case ViewState.CHAT: return <ChatView lang={effectiveLanguage} />;
      case ViewState.IMAGE_ANALYZE: return <AnalyzeView lang={effectiveLanguage} />;
      case ViewState.LESSON_HUB: return <LessonHub onSelectLesson={handleLessonSelect} progress={activeUser!} onUpdateInterests={updateInterests} lang={effectiveLanguage} />;
      case ViewState.LESSON_DETAIL:
        const lesson = lessons.find(l => l.id === activeLessonId);
        if (!lesson) return null;
        return <LessonDetailView lesson={lesson} onFinish={handleFinishLesson} onBack={() => setCurrentView(ViewState.LESSON_HUB)} lang={effectiveLanguage} cachedBackgroundImages={cachedBackgroundImages} onPreFetchNext={updateImageCache} />;
      default: return null;
    }
  };

  const langNames: Record<Language, string> = { en: 'English', he: 'עברית', es: 'Español', ru: 'Русский', ar: 'العربية' };

  return (
    <div className={`min-h-screen flex flex-col bg-[#f0f4f8] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-4 bg-white shadow-md flex justify-between items-center relative z-40">
        <button onClick={() => setCurrentView(userProgress.isAuthenticated ? ViewState.DASHBOARD : ViewState.LANDING)} className="flex items-center gap-3 text-blue-600 font-black text-2xl tracking-tight">
          <BookOpen size={28} /> <span>Dori AI</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          {userProgress.isAuthenticated && activeUser && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-2xl border border-blue-100 shadow-sm">
              <span className="font-black text-blue-800 text-sm hidden sm:inline">{activeUser.name}</span>
              <button onClick={handleSwitchAccount} className="p-1.5 hover:bg-blue-100 rounded-xl text-blue-600 transition-colors" title={t.switchAccount}><Users size={20} /></button>
            </div>
          )}
          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all font-black text-sm ${isLangMenuOpen ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : 'bg-white text-slate-700 border-slate-100 hover:border-blue-200 shadow-sm'}`}><Globe size={18} /> <span className="uppercase">{effectiveLanguage}</span><ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} /></button>
            {isLangMenuOpen && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-bounce-in overflow-hidden`}>
                <div className="px-4 py-2 mb-2 border-b border-slate-50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'בחר שפה' : 'Select Language'}</p></div>
                {(['en', 'he'] as Language[]).map((l) => (
                  <button key={l} onClick={() => handleLanguageChange(l)} className={`flex items-center justify-between w-full text-left px-5 py-3.5 text-base font-black transition-colors ${effectiveLanguage === l ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`} style={{ textAlign: l === 'he' ? 'right' : 'left', direction: l === 'he' ? 'rtl' : 'ltr' }}>
                    <span>{langNames[l]}</span>{effectiveLanguage === l && <Check size={18} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 p-0 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}

export default App;
