
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UI_STRINGS } from '../i18n/translations';
import { Language, UserAccount, ViewState, AccessibilitySettings } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { getLocalizedLessons } from '../data/lessons';
import { Sparkles, BookOpen, Camera, GraduationCap, Globe, ClipboardCheck, Info, Book, X, Volume2, Search, ShieldAlert, Layout, Compass, Eye } from 'lucide-react'; 
import { Avatar } from '../components/Avatar';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  progress: UserAccount;
  lang: Language;
  onChangeLanguage: () => void;
  accessibility: AccessibilitySettings;
}

const GLOSSARY_TERMS = [
  { term: 'The Cloud', analogy: { en: 'A digital safe in the sky. Your photos stay there even if you lose your phone.', he: 'כספת דיגיטלית בשמיים. התמונות נשארות שם גם אם הטלפון הולך לאיבוד.' } },
  { term: 'Browser', analogy: { en: 'A window to the internet library. Chrome or Safari are like different windows.', he: 'חלון לספריית האינטרנט. "כרום" או "ספארי" הם כמו חלונות שונים.' } },
  { term: 'URL', analogy: { en: 'An internet address. Just like your home address but for a website.', he: 'כתובת אינטרנט. בדיוק כמו כתובת המגורים שלך, רק עבור אתר.' } },
  { term: 'Cookies', analogy: { en: 'A website memory of you. Like a waiter who remembers your usual order.', he: 'זיכרון של האתר לגביך. כמו מלצר שזוכר את ההזמנה הקבועה שלך.' } }
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, progress, lang, onChangeLanguage, accessibility }) => {
  const t = UI_STRINGS[lang];
  const LESSONS = getLocalizedLessons(lang);
  const totalLessons = LESSONS.length;
  const completedLessons = progress.completedLessonIds.length;
  const [showGlossary, setShowGlossary] = useState(false);
  const [isPlayingTip, setIsPlayingTip] = useState(false);

  const accountId = progress.id.toLowerCase();
  let tag = '';
  if (accountId.includes('doris')) tag = t.dorisTag;
  else if (accountId.includes('solomon')) tag = t.solomonTag;
  else if (accountId.includes('goldie')) tag = t.goldieTag;
  else if (accountId.includes('victor')) tag = t.victorTag;

  const playTip = async () => {
    setIsPlayingTip(true);
    const text = `${t.tipTitle}: ${t.tagline}`;
    try {
      const audioCtx = new AudioContext({ sampleRate: 24000 });
      const base64 = await generateSpeech(text, 'Zephyr', { lang });
      const buffer = await decodeAudioData(decode(base64), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsPlayingTip(false);
      source.start(0);
    } catch (e) {
      setIsPlayingTip(false);
    }
  };

  const cardBaseClass = `p-8 md:p-10 rounded-[2.5rem] shadow-lg border transition-all ${
    accessibility.highContrast 
      ? 'bg-slate-900 border-slate-700 text-white' 
      : 'bg-white border-slate-50'
  }`;

  return (
    <div className={`max-w-5xl mx-auto space-y-6 md:space-y-10 pb-20 pt-6 md:pt-10 px-4 ${accessibility.extraLargeText ? 'text-2xl' : ''}`}>
      {/* Tip Banner */}
      <div className={`p-6 md:p-8 rounded-[2rem] border-4 flex flex-col md:flex-row items-center gap-6 ${accessibility.highContrast ? 'bg-slate-800 border-yellow-400' : 'bg-orange-50 border-orange-100'}`}>
        <div className="bg-orange-200 p-4 rounded-full text-orange-700 shadow-inner">
          <Sparkles size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-xl font-black text-orange-800 mb-1">{t.tipTitle}</h4>
          <p className="text-lg font-bold text-orange-700">{t.tagline}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={playTip} 
          isLoading={isPlayingTip}
          className={`!rounded-full !py-4 !px-6 ${accessibility.highContrast ? 'bg-slate-700 text-white border-slate-600' : ''}`}
        >
          <Volume2 size={24} /> {t.readAloud}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 md:gap-6 mb-6">
        <div className="relative">
          <Avatar seed={progress.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white shadow-xl" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg border border-white">
            <GraduationCap size={12} /> {tag}
          </div>
        </div>
        <div className="space-y-1 text-center">
          <h1 className={`text-3xl md:text-4xl font-black ${accessibility.highContrast ? 'text-white' : 'text-slate-800'}`}>
            {t.welcomeToDashboard} <span className={accessibility.highContrast ? 'text-yellow-400' : 'text-blue-600'}>{progress.name}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
        {/* Decision Dashboard - The Active Guided Navigation Path */}
        <Button onClick={() => onNavigate(ViewState.DECISION_DASHBOARD)} className={`flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] shadow-xl col-span-2 sm:col-span-3 md:col-span-6 !bg-blue-700 hover:!bg-blue-800 border-4 border-blue-900 group`}>
          <Compass size={accessibility.extraLargeText ? 64 : 48} className="mb-4 text-blue-200 group-hover:rotate-45 transition-transform duration-500" /> 
          <span className="text-white text-3xl md:text-5xl font-black">{t.decisionDashboard}</span>
          <span className="text-blue-200 text-sm md:text-lg mt-2">{t.decisionDashboardDesc}</span>
        </Button>

        {/* Live AI Lens - New Tool */}
        <Button onClick={() => onNavigate(ViewState.LIVE_LENS)} className={`flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] shadow-xl col-span-2 sm:col-span-3 md:col-span-6 !bg-purple-600 hover:!bg-purple-700 border-4 border-purple-800 group`}>
          <Eye size={accessibility.extraLargeText ? 64 : 48} className="mb-2 text-purple-100 animate-pulse" /> 
          <span className="text-white text-2xl md:text-4xl font-black">{t.liveLens}</span>
          <span className="text-purple-100 text-sm md:text-base mt-1">{t.liveLensDesc}</span>
        </Button>

        <Button onClick={() => onNavigate(ViewState.LESSON_HUB)} className={`flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] shadow-xl ${accessibility.highContrast ? '!bg-slate-800 !border-slate-700 border-4' : '!bg-blue-600'}`}>
          <BookOpen size={accessibility.extraLargeText ? 48 : 32} className="mb-2" /> {t.myLessons}
        </Button>
        <Button onClick={() => onNavigate(ViewState.CHAT)} className={`flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] shadow-xl ${accessibility.highContrast ? '!bg-slate-800 !border-slate-700 border-4' : '!bg-emerald-600'}`}>
          <Sparkles size={accessibility.extraLargeText ? 48 : 32} className="mb-2" /> {t.askAI}
        </Button>
        <Button onClick={() => onNavigate(ViewState.BUREAUCRACY_TRANSLATOR)} className={`flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] shadow-xl ${accessibility.highContrast ? '!bg-slate-800 !border-slate-700 border-4' : '!bg-orange-600'}`}>
          <ClipboardCheck size={accessibility.extraLargeText ? 48 : 32} className="mb-2" /> {t.bureaucracyTranslator}
        </Button>
        <Button onClick={() => onNavigate(ViewState.IMAGE_ANALYZE)} className={`flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] shadow-xl ${accessibility.highContrast ? '!bg-slate-800 !border-slate-700 border-4' : '!bg-slate-700'}`}>
          <Camera size={accessibility.extraLargeText ? 48 : 32} className="mb-2" /> {t.explainPhotos}
        </Button>
        <Button onClick={() => onNavigate(ViewState.MIRROR_SANDBOX)} className={`flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] shadow-xl ${accessibility.highContrast ? '!bg-slate-800 !border-slate-700 border-4' : '!bg-indigo-600'}`}>
          <Layout size={accessibility.extraLargeText ? 48 : 32} className="mb-2" /> {t.mirrorWorld}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className={cardBaseClass}>
          <h2 className={`text-xl md:text-2xl font-black mb-6 flex items-center gap-3 ${accessibility.highContrast ? 'text-yellow-400' : 'text-blue-600'}`}>
            <BookOpen size={24} /> {t.overallLearningProgress}
          </h2>
          <ProgressBar current={completedLessons} total={totalLessons} label={t.lessonsCompleted} />
        </div>

        <div className={`${cardBaseClass} relative overflow-hidden group cursor-pointer`} onClick={() => setShowGlossary(true)}>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Book size={100} />
          </div>
          <h2 className={`text-xl md:text-2xl font-black mb-4 flex items-center gap-3 ${accessibility.highContrast ? 'text-yellow-400' : 'text-orange-500'}`}>
            <Info size={24} /> {t.glossaryTitle}
          </h2>
          <p className="text-lg font-bold mb-6 opacity-70">{t.glossaryDesc}</p>
          <div className={`inline-flex items-center gap-2 font-black uppercase text-sm tracking-widest px-4 py-2 rounded-xl ${accessibility.highContrast ? 'bg-slate-700 text-yellow-400' : 'bg-orange-50 text-orange-600'}`}>
             {t.startNow} <Search size={16} />
          </div>
        </div>
      </div>

      {showGlossary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className={`w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative border-4 ${accessibility.highContrast ? 'bg-slate-900 border-yellow-400 text-white' : 'bg-white'}`}>
              <button onClick={() => setShowGlossary(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900">
                <X size={32} />
              </button>
              <div className="p-8 md:p-12 space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-black mb-2">{t.glossaryTitle}</h3>
                  <p className="text-xl opacity-70 font-bold">{t.glossaryDesc}</p>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {GLOSSARY_TERMS.map((term, i) => (
                    <div key={i} className={`p-6 rounded-[1.5rem] border transition-colors ${accessibility.highContrast ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 hover:border-orange-200'}`}>
                      <h4 className={`text-xl font-black mb-2 ${accessibility.highContrast ? 'text-yellow-400' : 'text-orange-600'}`}>{term.term}</h4>
                      <p className="text-lg font-bold opacity-80 leading-relaxed">
                        {(term.analogy as any)[lang] || term.analogy.en}
                      </p>
                    </div>
                  ))}
                </div>
                <Button fullWidth onClick={() => setShowGlossary(false)} className="!py-5 !text-xl !rounded-2xl">
                  {t.close}
                </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
