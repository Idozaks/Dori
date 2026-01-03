
import React, { useState } from 'react';
import { UserAccount, LessonCategory, Language } from '../types';
import { getLocalizedLessons, getLocalizedCategories } from '../data/lessons';
import { UI_STRINGS } from '../i18n/translations';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { CheckCircle2, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

interface LessonHubProps {
  onSelectLesson: (id: string) => void;
  progress: UserAccount;
  onUpdateInterests: (interests: LessonCategory[]) => void;
  lang: Language;
}

export const LessonHub: React.FC<LessonHubProps> = ({ onSelectLesson, progress, onUpdateInterests, lang }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  const LESSONS = getLocalizedLessons(lang);
  const CATEGORIES = getLocalizedCategories(lang);

  const [showSetup, setShowSetup] = useState(progress.selectedInterests.length === 0);

  const toggleInterest = (cat: LessonCategory) => {
    const current = progress.selectedInterests;
    if (current.includes(cat)) {
      onUpdateInterests(current.filter(c => c !== cat));
    } else {
      onUpdateInterests([...current, cat]);
    }
  };

  if (showSetup) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-slate-100 text-center">
          <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-inner">
            <GraduationCap size={56} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-6 leading-tight">{t.personalize}</h2>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">{t.whatInterested}</p>
          
          <div className="space-y-4 mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleInterest(cat.id)}
                className={`w-full p-5 rounded-2xl border-4 flex items-center gap-4 transition-all transform active:scale-95 ${
                  progress.selectedInterests.includes(cat.id)
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                <div className={`p-3 rounded-xl shadow-sm ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="text-xl font-black text-slate-800 flex-1">{cat.label}</span>
                {progress.selectedInterests.includes(cat.id) && (
                  <CheckCircle2 className="text-blue-600" size={24} />
                )}
              </button>
            ))}
          </div>

          <Button 
            fullWidth 
            onClick={() => setShowSetup(false)}
            disabled={progress.selectedInterests.length === 0}
            className="!py-5 !text-xl !rounded-2xl"
          >
            {t.createPath}
          </Button>
        </div>
      </div>
    );
  }

  const filteredLessons = LESSONS.filter(l => progress.selectedInterests.includes(l.category));
  const completedCount = LESSONS.filter(l => progress.completedLessonIds.includes(l.id)).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-1">{t.learnCenter}</h2>
          <p className="text-slate-500 text-lg font-medium">{t.masterDigital}</p>
        </div>
        <button 
          onClick={() => setShowSetup(true)}
          className="text-blue-600 font-black text-sm hover:underline bg-blue-50 px-4 py-2 rounded-full border border-blue-100 transition-colors"
        >
          {t.changeInterests}
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">{t.overallProgress}</h3>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-black text-sm">
            {Math.round((completedCount / LESSONS.length) * 100)}%
          </span>
        </div>
        <ProgressBar current={completedCount} total={LESSONS.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map(lesson => {
          const isCompleted = progress.completedLessonIds.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              className={`group flex items-start gap-5 p-6 rounded-[2rem] bg-white border-2 transition-all transform hover:-translate-y-1 active:scale-95 text-left shadow-md ${
                isCompleted ? 'border-emerald-100' : 'border-slate-50 hover:border-blue-500'
              }`}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              <div className={`p-4 rounded-2xl shadow-inner transition-colors shrink-0 ${
                isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
              }`}>
                {lesson.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest truncate">
                     {CATEGORIES.find(c => c.id === lesson.category)?.label}
                   </span>
                   {isCompleted && (
                     <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm">
                       <CheckCircle2 size={10} strokeWidth={4} /> {t.completed}
                     </span>
                   )}
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-700 transition-colors mb-1 truncate">
                  {lesson.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-normal line-clamp-2">
                  {lesson.shortDesc}
                </p>
              </div>

              <div className={`mt-2 shrink-0 transition-all ${
                isCompleted ? 'text-emerald-500' : 'text-slate-300 group-hover:text-blue-600'
              }`}>
                {isRTL ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
              </div>
            </button>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="bg-white p-12 rounded-[3rem] text-center border-4 border-dashed border-slate-100 shadow-inner">
           <GraduationCap size={64} className="mx-auto text-slate-200 mb-4" />
           <p className="text-2xl font-black text-slate-400">{t.noLessonsFound}</p>
           <Button onClick={() => setShowSetup(true)} variant="secondary" className="mt-6 !rounded-full !px-8">
             {t.changeInterests}
           </Button>
        </div>
      )}
    </div>
  );
};
