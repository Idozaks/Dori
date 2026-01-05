
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UI_STRINGS } from '../i18n/translations';
import { Language, UserAccount, ViewState } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { getLocalizedLessons, getLocalizedCategories } from '../data/lessons';
import { Sparkles, BookOpen, Camera, Search, GraduationCap, Globe, ClipboardCheck, Info, Book, X } from 'lucide-react';
import { Avatar } from '../components/Avatar';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  progress: UserAccount;
  lang: Language;
  onChangeLanguage: () => void;
}

const GLOSSARY_TERMS = [
  { term: 'The Cloud', analogy: { en: 'A digital safe in the sky. Your photos stay there even if you lose your phone.', he: 'כספת דיגיטלית בשמיים. התמונות נשארות שם גם אם הטלפון הולך לאיבוד.' } },
  { term: 'Browser', analogy: { en: 'A window to the internet library. Chrome or Safari are like different windows.', he: 'חלון לספריית האינטרנט. "כרום" או "ספארי" הם כמו חלונות שונים.' } },
  { term: 'URL', analogy: { en: 'An internet address. Just like your home address but for a website.', he: 'כתובת אינטרנט. בדיוק כמו כתובת המגורים שלך, רק עבור אתר.' } },
  { term: 'Cookies', analogy: { en: 'A website memory of you. Like a waiter who remembers your usual order.', he: 'זיכרון של האתר לגביך. כמו מלצר שזוכר את ההזמנה הקבועה שלך.' } }
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, progress, lang, onChangeLanguage }) => {
  const t = UI_STRINGS[lang];
  const LESSONS = getLocalizedLessons(lang);
  const totalLessons = LESSONS.length;
  const completedLessons = progress.completedLessonIds.length;
  const [showGlossary, setShowGlossary] = useState(false);

  const accountId = progress.id.toLowerCase();
  let tag = '';
  if (accountId.includes('doris')) tag = t.dorisTag;
  else if (accountId.includes('solomon')) tag = t.solomonTag;
  else if (accountId.includes('goldie')) tag = t.goldieTag;
  else if (accountId.includes('victor')) tag = t.victorTag;

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 pb-20 pt-6 md:pt-10 px-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 md:gap-6 mb-6">
        <div className="relative">
          <Avatar seed={progress.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white shadow-xl" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg border border-white">
            <GraduationCap size={12} /> {tag}
          </div>
        </div>
        <div className="space-y-1 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">
            {t.welcomeToDashboard} <span className="text-blue-600">{progress.name}</span>
          </h1>
          <button onClick={onChangeLanguage} className="inline-flex items-center gap-1 text-blue-500 font-black text-xs uppercase tracking-widest hover:text-blue-700">
            <Globe size={14} /> {lang === 'he' ? 'שנה שפה' : 'Change Language'}
          </button>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Button onClick={() => onNavigate(ViewState.LESSON_HUB)} className="flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] !bg-blue-600 shadow-xl shadow-blue-100">
          <BookOpen size={32} className="mb-2" /> {t.myLessons}
        </Button>
        <Button onClick={() => onNavigate(ViewState.CHAT)} className="flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] !bg-emerald-600 shadow-xl shadow-emerald-100">
          <Sparkles size={32} className="mb-2" /> {t.askAI}
        </Button>
        <Button onClick={() => onNavigate(ViewState.BUREAUCRACY_TRANSLATOR)} className="flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] !bg-orange-600 shadow-xl shadow-orange-100">
          <ClipboardCheck size={32} className="mb-2" /> {t.bureaucracyTranslator}
        </Button>
        <Button onClick={() => onNavigate(ViewState.IMAGE_ANALYZE)} className="flex-col !py-8 md:!py-12 !text-base md:!text-xl !rounded-[2rem] !bg-slate-700 shadow-xl shadow-slate-200">
          <Camera size={32} className="mb-2" /> {t.explainPhotos}
        </Button>
      </div>

      {/* Stats and Glossary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-50">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <BookOpen size={24} className="text-blue-600" /> {t.overallLearningProgress}
          </h2>
          <ProgressBar current={completedLessons} total={totalLessons} label={t.lessonsCompleted} />
          <p className="text-lg text-slate-500 mt-6 font-bold">
            {t.youHaveCompleted} <span className="text-blue-600 font-black">{completedLessons}</span> {t.outOf} {totalLessons} {t.lessons}.
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-50 relative overflow-hidden group cursor-pointer" onClick={() => setShowGlossary(true)}>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Book size={100} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
            <Info size={24} className="text-orange-500" /> {t.glossaryTitle}
          </h2>
          <p className="text-lg text-slate-500 font-bold mb-6">{t.glossaryDesc}</p>
          <div className="inline-flex items-center gap-2 text-orange-600 font-black uppercase text-sm tracking-widest bg-orange-50 px-4 py-2 rounded-xl">
             {t.startNow} <Search size={16} />
          </div>
        </div>
      </div>

      {/* Glossary Modal */}
      {showGlossary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative">
              <button onClick={() => setShowGlossary(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900">
                <X size={32} />
              </button>
              <div className="p-8 md:p-12 space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-black text-slate-900 mb-2">{t.glossaryTitle}</h3>
                  <p className="text-xl text-slate-500 font-bold">{t.glossaryDesc}</p>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {GLOSSARY_TERMS.map((term, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 hover:border-orange-200 transition-colors">
                      <h4 className="text-xl font-black text-orange-600 mb-2">{term.term}</h4>
                      <p className="text-lg font-bold text-slate-700 leading-relaxed">
                        {(term.analogy as any)[lang] || term.analogy.en}
                      </p>
                    </div>
                  ))}
                </div>
                <Button fullWidth onClick={() => setShowGlossary(false)} className="!py-5 !text-xl !rounded-2xl !bg-orange-600">
                  {t.close}
                </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
