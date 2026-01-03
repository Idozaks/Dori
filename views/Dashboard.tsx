
import React from 'react';
import { Button } from '../components/Button';
import { UI_STRINGS } from '../i18n/translations';
import { Language, UserAccount } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { getLocalizedLessons, getLocalizedCategories } from '../data/lessons';
import { Sparkles, BookOpen, Camera, Search, GraduationCap, Globe } from 'lucide-react';
import { EngagementDisplay } from '../components/EngagementDisplay';

const Avatar = ({ seed, className }: { seed: string, className?: string }) => {
  const isDoris = seed === 'doris';
  const isSolomon = seed === 'solomon';
  const isGoldie = seed === 'goldie';

  return (
    <div className={`aspect-square overflow-hidden bg-slate-100 rounded-full flex items-center justify-center ${className}`}>
      {isDoris && (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#65c9ff" />
          <path d="M50 85c-15 0-25-10-25-25V45c0-14 11-25 25-25s25 11 25 25v15c0 15-10 25-25 25z" fill="#ffdbac" />
          <path d="M25 45c0-14 11-25 25-25s25 11 25 25v10H25V45z" fill="#4b2c20" />
          <path d="M25 45c0 10 5 15 5 25 0 10-5 20-5 20s20 5 25 5 25-5 25-5-5-10-5-20c0-10 5-15 5-25H25z" fill="#4b2c20" />
          <circle cx="42" cy="50" r="3" fill="#333" />
          <circle cx="58" cy="50" r="3" fill="#333" />
          <path d="M43 65q7 5 14 0" stroke="#d48c8c" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M30 95c0-10 10-15 20-15s20 5 20 15H30z" fill="#1e40af" />
        </svg>
      )}
      {isSolomon && (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#ffd5dc" />
          <path d="M50 82c-12 0-22-10-22-22V45c0-12 10-22 22-22s22 10 22 22v15c0 12-10 22-22 22z" fill="#f1c27d" />
          <path d="M35 30q15-10 30 0" stroke="#ccc" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="35" y="42" width="12" height="8" rx="2" stroke="#333" strokeWidth="1.5" fill="none" />
          <rect x="53" y="42" width="12" height="8" rx="2" stroke="#333" strokeWidth="1.5" fill="none" />
          <line x1="47" y1="46" x2="53" y2="46" stroke="#333" strokeWidth="1.5" />
          <circle cx="41" cy="46" r="1.5" fill="#333" />
          <circle cx="59" cy="46" r="1.5" fill="#333" />
          <path d="M45 68q5 3 10 0" stroke="#333" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M30 95c0-10 10-15 20-15s20 5 20 15H30z" fill="#475569" />
        </svg>
      )}
      {isGoldie && (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#c0aede" />
          <path d="M20 55c0-20 10-35 30-35s30 15 30 35v15c0 5-5 10-10 10H30c-5 0-10-5-10-10V55z" fill="#fcd34d" />
          <path d="M50 85c-15 0-25-10-25-25V45c0-14 11-25 25-25s25 11 25 25v15c0 15-10 25-25 25z" fill="#ffe4c4" />
          <circle cx="42" cy="52" r="2.5" fill="#333" />
          <circle cx="58" cy="52" r="2.5" fill="#333" />
          <path d="M43 68c2 3 12 3 14 0" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M30 95c0-10 10-15 20-15s20 5 20 15H30z" fill="#be185d" />
        </svg>
      )}
    </div>
  );
};

interface DashboardProps {
  onNavigateToLessons: () => void;
  onNavigateToChat: () => void;
  onNavigateToAnalyze: () => void;
  progress: UserAccount;
  lang: Language;
  onChangeLanguage: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToLessons,
  onNavigateToChat,
  onNavigateToAnalyze,
  progress,
  lang,
  onChangeLanguage
}) => {
  const t = UI_STRINGS[lang];
  const LESSONS = getLocalizedLessons(lang);
  const CATEGORIES = getLocalizedCategories(lang);

  const totalLessons = LESSONS.length;
  const completedLessons = progress.completedLessonIds.length;

  const accountId = progress.id.toLowerCase();
  const tag = accountId.includes('doris') ? t.dorisTag : accountId.includes('solomon') ? t.solomonTag : t.goldieTag;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 pt-10 px-4">
      <div className="flex flex-col items-center gap-6 mb-10">
        <div className="relative">
          <Avatar seed={progress.avatar} className="w-32 h-32 rounded-[2.5rem] border-8 border-white shadow-2xl" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg border-2 border-white whitespace-nowrap">
            <GraduationCap size={14} /> {tag}
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 leading-tight">
            {t.welcomeToDashboard} <span className="text-blue-600">{progress.name}</span>!
          </h1>
          <button
            onClick={onChangeLanguage}
            className="inline-flex items-center gap-2 text-blue-500 font-black text-sm uppercase tracking-widest hover:text-blue-700 transition-colors"
          >
            <Globe size={16} /> {lang === 'he' ? 'שנה שפה' : 'Change Language'}
          </button>
        </div>
      </div>

      <EngagementDisplay user={progress} lang={lang} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button
          onClick={onNavigateToLessons}
          className="!py-10 !text-2xl !rounded-[2.5rem] !bg-blue-600 hover:!bg-blue-700 !border-blue-800"
        >
          <BookOpen size={32} /> {t.myLessons}
        </Button>
        <Button
          onClick={onNavigateToChat}
          className="!py-10 !text-2xl !rounded-[2.5rem] !bg-green-600 hover:!bg-green-700 !border-green-800"
        >
          <Sparkles size={32} /> {t.askAI}
        </Button>
        <Button
          onClick={onNavigateToAnalyze}
          className="!py-10 !text-2xl !rounded-[2.5rem] !bg-orange-600 hover:!bg-orange-700 !border-orange-800"
        >
          <Camera size={32} /> {t.explainPhotos}
        </Button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-xl border-2 border-slate-100">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <BookOpen size={32} className="text-blue-600" /> {t.overallLearningProgress}
          </h2>
          <ProgressBar current={completedLessons} total={totalLessons} label={t.lessonsCompleted} />
          <p className="text-lg sm:text-xl text-slate-500 mt-6 leading-relaxed">
            {t.youHaveCompleted} <span className="font-black text-blue-700">{completedLessons}</span> {t.outOf} <span className="font-black text-blue-700">{totalLessons}</span> {t.lessons}.
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-xl border-2 border-slate-100">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Search size={32} className="text-purple-600" /> {t.progressByCategory}
          </h2>
          <div className="space-y-6">
            {CATEGORIES.map(category => {
              const catLessons = LESSONS.filter(l => l.category === category.id);
              const completed = catLessons.filter(l => progress.completedLessonIds.includes(l.id)).length;
              return (
                <div key={category.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-slate-600 uppercase text-[10px] tracking-widest">{category.label}</span>
                    <span className="text-xs font-black text-blue-600">{completed}/{catLessons.length}</span>
                  </div>
                  <ProgressBar current={completed} total={catLessons.length} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
