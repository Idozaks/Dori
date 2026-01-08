
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewState, UserProgress, UserAccount, LessonCategory, Language, CachedImageMap, AccessibilitySettings } from './types';
import { ChatView } from './views/ChatView';
import { AnalyzeView } from './views/AnalyzeView';
import { LessonHub } from './views/LessonHub';
import { LessonDetailView } from './views/LessonDetailView';
import { Dashboard } from './views/Dashboard';
import { LandingView } from './views/LandingView';
import { BureaucracyTranslatorView } from './views/BureaucracyTranslatorView';
import { getLocalizedLessons } from './data/lessons';
import { UI_STRINGS } from './i18n/translations';
import { generateNanoBananaImage, generateSpeech, decode, decodeAudioData } from './services/geminiService';
import { BookOpen, Globe, Users, Check, Accessibility, X, Volume2, Type, Sun, VolumeX } from 'lucide-react';
import { Button } from './components/Button';

const STORAGE_KEY = 'doriai_multi_user_v2';
const ACCESSIBILITY_KEY = 'doriai_accessibility_v1';
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

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem(ACCESSIBILITY_KEY);
    return saved ? JSON.parse(saved) : { voiceGuidance: false, highContrast: false, extraLargeText: false };
  });

  const [displayLanguage, setDisplayLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem(TEMPORARY_LANG_KEY);
    return (savedLang as Language) || 'en';
  });

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [cachedBackgroundImages, setCachedBackgroundImages] = useState<CachedImageMap>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const activeUser = userProgress.accounts.find(a => a.id === userProgress.currentAccountId);
  const t = UI_STRINGS[displayLanguage];
  const isRTL = displayLanguage === 'he' || displayLanguage === 'ar';
  const lessons = getLocalizedLessons(displayLanguage);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress)); }, [userProgress]);
  useEffect(() => { localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(accessibility)); }, [accessibility]);
  useEffect(() => { localStorage.setItem(TEMPORARY_LANG_KEY, displayLanguage); }, [displayLanguage]);

  // Voice Guidance Trigger
  useEffect(() => {
    if (accessibility.voiceGuidance && userProgress.isAuthenticated) {
      let messageKey = '';
      switch (currentView) {
        case ViewState.DASHBOARD: messageKey = 'narratorDashboard'; break;
        case ViewState.LESSON_HUB: messageKey = 'narratorLessons'; break;
        case ViewState.CHAT: messageKey = 'narratorChat'; break;
        case ViewState.IMAGE_ANALYZE: messageKey = 'narratorExplain'; break;
        case ViewState.BUREAUCRACY_TRANSLATOR: messageKey = 'narratorBureaucracy'; break;
      }
      if (messageKey) {
        playNarrator(t[messageKey]);
      }
    }
  }, [currentView, accessibility.voiceGuidance, userProgress.isAuthenticated]);

  const playNarrator = async (text: string) => {
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    try {
      const base64 = await generateSpeech(text, 'Zephyr', { lang: displayLanguage });
      const buffer = await decodeAudioData(decode(base64), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      currentAudioSourceRef.current = source;
    } catch (e) {
      console.error("Narrator failed:", e);
    }
  };

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

  const renderContent = () => {
    if (!userProgress.isAuthenticated) return <LandingView lang={displayLanguage} onLogin={handleLogin} accounts={userProgress.accounts} />;
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard onNavigate={(v) => setCurrentView(v)} progress={activeUser!} lang={displayLanguage} onChangeLanguage={() => setIsLangMenuOpen(true)} accessibility={accessibility} />;
      case ViewState.CHAT: return <ChatView lang={displayLanguage} />;
      case ViewState.IMAGE_ANALYZE: return <AnalyzeView lang={displayLanguage} />;
      case ViewState.BUREAUCRACY_TRANSLATOR: return <BureaucracyTranslatorView lang={displayLanguage} />;
      case ViewState.LESSON_HUB: return <LessonHub onSelectLesson={(id) => { setActiveLessonId(id); setCurrentView(ViewState.LESSON_DETAIL); }} progress={activeUser!} onUpdateInterests={(interests) => setUserProgress(prev => ({ ...prev, accounts: prev.accounts.map(a => a.id === prev.currentAccountId ? { ...a, selectedInterests: interests } : a) }))} lang={displayLanguage} />;
      case ViewState.LESSON_DETAIL:
        const lesson = lessons.find(l => l.id === activeLessonId);
        if (!lesson) return null;
        return <LessonDetailView lesson={lesson} onFinish={(id) => { setUserProgress(prev => ({ ...prev, accounts: prev.accounts.map(a => a.id === prev.currentAccountId ? { ...a, completedLessonIds: a.completedLessonIds.includes(id) ? a.completedLessonIds : [...a.completedLessonIds, id] } : a) })); setCurrentView(ViewState.LESSON_HUB); }} onBack={() => setCurrentView(ViewState.LESSON_HUB)} lang={displayLanguage} cachedBackgroundImages={cachedBackgroundImages} onPreFetchNext={updateImageCache} />;
      default: return null;
    }
  };

  const langNames: Record<Language, string> = { en: 'English', he: 'עברית', es: 'Español', ru: 'Русский', ar: 'العربية' };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${accessibility.highContrast ? 'bg-black' : 'bg-[#f8fafc]'} ${accessibility.extraLargeText ? 'text-2xl' : ''} ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className={`p-4 shadow-sm flex justify-between items-center sticky top-0 z-40 border-b ${accessibility.highContrast ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
        <button onClick={handleLogoClick} className={`flex items-center gap-3 font-black text-2xl tracking-tight ${accessibility.highContrast ? 'text-yellow-400' : 'text-blue-600'}`}>
          <BookOpen size={28} /> <span>Dori AI</span>
        </button>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsAccessibilityOpen(true)}
            className={`p-2 rounded-xl transition-all ${accessibility.highContrast ? 'text-yellow-400 bg-slate-800' : 'text-blue-600 bg-blue-50'}`}
          >
            <Accessibility size={28} />
          </button>
          <div className="relative">
            <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 font-black text-sm uppercase ${accessibility.highContrast ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-100 text-slate-700'}`}><Globe size={18} /> {displayLanguage}</button>
            {isLangMenuOpen && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-in`}>
                {(['en', 'he'] as Language[]).map((l) => (
                  <button key={l} onClick={() => handleLanguageChange(l)} className={`flex items-center justify-between w-full px-5 py-3 text-base font-black ${displayLanguage === l ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <span>{langNames[l]}</span>{displayLanguage === l && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {isAccessibilityOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg rounded-[3rem] p-8 space-y-8 shadow-2xl border-4 ${accessibility.highContrast ? 'bg-slate-900 border-yellow-400 text-white' : 'bg-white border-blue-50'}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black">{t.accessibilityMenu}</h3>
              <button onClick={() => setIsAccessibilityOpen(false)}><X size={32} /></button>
            </div>
            <p className="text-xl opacity-70 font-bold">{t.accessibilityDesc}</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => setAccessibility(p => ({...p, voiceGuidance: !p.voiceGuidance}))}
                className={`w-full p-6 rounded-3xl border-4 flex items-center justify-between transition-all ${accessibility.voiceGuidance ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-100 bg-slate-50 text-slate-600'}`}
              >
                <div className="flex items-center gap-4">
                  {accessibility.voiceGuidance ? <Volume2 size={32} /> : <VolumeX size={32} />}
                  <span className="text-2xl font-black">{accessibility.voiceGuidance ? t.voiceGuidanceOn : t.voiceGuidanceOff}</span>
                </div>
                <div className={`w-12 h-6 rounded-full relative ${accessibility.voiceGuidance ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${accessibility.voiceGuidance ? 'right-1' : 'left-1'}`} />
                </div>
              </button>

              <button 
                onClick={() => setAccessibility(p => ({...p, extraLargeText: !p.extraLargeText}))}
                className={`w-full p-6 rounded-3xl border-4 flex items-center justify-between transition-all ${accessibility.extraLargeText ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-100 bg-slate-50 text-slate-600'}`}
              >
                <div className="flex items-center gap-4">
                  <Type size={32} />
                  <span className="text-2xl font-black">{t.extraLargeText}</span>
                </div>
                <div className={`w-12 h-6 rounded-full relative ${accessibility.extraLargeText ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${accessibility.extraLargeText ? 'right-1' : 'left-1'}`} />
                </div>
              </button>

              <button 
                onClick={() => setAccessibility(p => ({...p, highContrast: !p.highContrast}))}
                className={`w-full p-6 rounded-3xl border-4 flex items-center justify-between transition-all ${accessibility.highContrast ? 'border-yellow-400 bg-slate-800 text-yellow-400' : 'border-slate-100 bg-slate-50 text-slate-600'}`}
              >
                <div className="flex items-center gap-4">
                  <Sun size={32} />
                  <span className="text-2xl font-black">{t.highContrast}</span>
                </div>
                <div className={`w-12 h-6 rounded-full relative ${accessibility.highContrast ? 'bg-yellow-400' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${accessibility.highContrast ? 'right-1' : 'left-1'}`} />
                </div>
              </button>
            </div>

            <Button fullWidth onClick={() => setIsAccessibilityOpen(false)} className="!py-6 !text-2xl !rounded-3xl">
              {t.close}
            </Button>
          </div>
        </div>
      )}

      <main className="flex-1">{renderContent()}</main>
    </div>
  );
}

export default App;
