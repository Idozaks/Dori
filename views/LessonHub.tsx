import React, { useState } from 'react';
import { ViewState, UserProgress, LessonCategory, Language } from '../types';
import { getLocalizedLessons, getLocalizedCategories } from '../data/lessons';
import { UI_STRINGS } from '../i18n/translations';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { CheckCircle2, ChevronRight, GraduationCap, Heart, ChevronLeft } from 'lucide-react';

interface LessonHubProps {
  onSelectLesson: (id: string) => void;
  progress: UserProgress;
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
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-slate-100 text-center">
          <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-inner">
            <GraduationCap size={56} />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-6 leading-tight">{t.personalize}</h2>
          <p className="text-2xl text-slate-600 mb-10 leading-relaxed">{t.whatInterested}</p>
          
          <div className="space-y-5 mb-12">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleInterest(cat.id)}
                className={`w-full p-6 rounded-3xl border-4 text-left flex items-center gap-5 transition-all transform active:scale-95 ${
                  progress.selectedInterests.includes(cat.id)
                    ? 'border-blue-600 bg-blue-50 shadow-xl'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                <div className={`p-4 rounded-2xl shadow-sm ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="text-2xl font-black text-slate-800 flex-1">{cat.label}</span>
                {progress.selectedInterests.includes(cat.id) && (
                  <CheckCircle2 className="text-blue-600" size={32} />
                )}
              </button>
            ))}
          </div>

          <Button 
            fullWidth 
            onClick={() => setShowSetup(false)}
            disabled={progress.selectedInterests.length === 0}
            className="!py-6 !text-2xl !rounded-3xl shadow-blue-200"
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
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className={isRTL ? 'md:text-right' : 'md:text-left'}>
          <h2 className="text-4xl font-black text-slate-800 mb-2">{t.learnCenter}</h2>
          <p className="text-slate-500 text-2xl font-medium">{t.masterDigital}</p>
        </div>
        <button 
          onClick={() => setShowSetup(true)}
          className="text-blue-600 font-black text-xl hover:underline bg-blue-50 px-6 py-3 rounded-2xl"
        >
          {t.changeInterests}
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100">
        <ProgressBar 
          current={completedCount} 
          total={LESSONS.length} 
          label={t.overallProgress}
        />
      </div>

      <div className="space-y-6">
        {filteredLessons.map(lesson => {
          const isCompleted = progress.completedLessonIds.includes(lesson.id);
          const category = CATEGORIES.find(c => c.id === lesson.category);
          
          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              className={`w-full bg-white p-8 rounded-[2.5rem] border-4 flex items-center gap-8 text-left transition-all hover:shadow-2xl hover:-translate-y-1 ${
                isCompleted ? 'border-green-100 bg-slate-50/50' : 'border-white hover:border-blue-200'
              }`}
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg ${category?.color || 'bg-slate-100'}`}>
                {lesson.icon}
              </div>
              <div className="flex-1" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">
                    {category?.label}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-xs font-black text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-200 uppercase">
                      <CheckCircle2 size={14} /> {t.completed}
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-1">{lesson.title}</h3>
                <p className="text-slate-600 text-xl font-medium leading-snug">{lesson.shortDesc}</p>
              </div>
              {isRTL ? <ChevronLeft size={40} className="text-slate-300" /> : <ChevronRight size={40} className="text-slate-300" />}
            </button>
          );
        })}
      </div>

      <div className="bg-blue-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-200">
        <div className="bg-white/20 p-6 rounded-3xl">
          <Heart size={56} />
        </div>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h4 className="text-3xl font-black mb-3">{t.doingGreat}</h4>
          <p className="text-blue-50 text-2xl font-medium leading-relaxed">
            {t.keepGoing}
          </p>
        </div>
      </div>
    </div>
  );
};