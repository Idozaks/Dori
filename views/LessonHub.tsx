
import React, { useState, useEffect } from 'react';
import { UserAccount, LessonCategory, Language, Lesson } from '../types';
import { getLocalizedLessons, getLocalizedCategories } from '../data/lessons';
import { UI_STRINGS } from '../i18n/translations';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { generateAdaptivePath } from '../services/geminiService';
import { 
  CheckCircle2, ChevronRight, Sparkles, 
  Compass, Trophy, Lock, RefreshCw, Star, 
  ArrowRight, Route, ChevronLeft, BookOpen, Layers, Filter, Grid
} from 'lucide-react';
import { LoadingBar } from '../components/LoadingBar';

interface LessonHubProps {
  onSelectLesson: (id: string) => void;
  progress: UserAccount;
  onUpdateInterests: (interests: LessonCategory[]) => void;
  lang: Language;
  onUpdatePath: (pathIds: string[], pathTitle: string) => void;
}

type HubMode = 'LIBRARY' | 'JOURNEY' | 'SETUP';

export const LessonHub: React.FC<LessonHubProps> = ({ onSelectLesson, progress, onUpdateInterests, lang, onUpdatePath }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  const ALL_LESSONS = getLocalizedLessons(lang);
  const CATEGORIES = getLocalizedCategories(lang);

  // Set default mode to LIBRARY explicitly to ensure user sees all lessons first.
  const [hubMode, setHubMode] = useState<HubMode>('LIBRARY');
  const [activeCategory, setActiveCategory] = useState<LessonCategory | 'ALL'>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Scroll to top whenever hubMode changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hubMode]);

  const currentPathIds = progress.generatedPathIds || [];
  const pathLessons = currentPathIds.map(id => ALL_LESSONS.find(l => l.id === id)).filter(Boolean) as Lesson[];
  
  const completedInPath = pathLessons.filter(l => progress.completedLessonIds.includes(l.id)).length;
  const isPathComplete = pathLessons.length > 0 && completedInPath === pathLessons.length;

  const filteredLessons = activeCategory === 'ALL' 
    ? ALL_LESSONS 
    : ALL_LESSONS.filter(l => l.category === activeCategory);

  const handleGeneratePath = async () => {
    if (progress.selectedInterests.length === 0) return;

    setIsGenerating(true);
    
    try {
      const result = await generateAdaptivePath(
        progress.selectedInterests,
        ALL_LESSONS.map(l => l.id),
        lang,
        {
          lang,
          onProgress: (p, m) => { setLoadingProgress(p); setLoadingMessage(m); }
        }
      );
      onUpdatePath(result.pathIds, result.pathTitle);
      setHubMode('JOURNEY');
    } catch (error) {
      console.error("Path generation failed", error);
      const fallbackIds = ALL_LESSONS
        .filter(l => progress.selectedInterests.includes(l.category))
        .map(l => l.id)
        .slice(0, 5);
      onUpdatePath(fallbackIds, t.pathTitlePlaceholder);
      setHubMode('JOURNEY');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleInterest = (cat: LessonCategory) => {
    const current = progress.selectedInterests;
    const next = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    onUpdateInterests(next);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-4">
        <LoadingBar message={loadingMessage} progress={loadingProgress} lang={lang} estimatedDuration={7000} />
      </div>
    );
  }

  // Journey Setup View
  if (hubMode === 'SETUP') {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex justify-start mb-6">
           <button onClick={() => setHubMode('LIBRARY')} className="text-slate-400 font-black text-sm uppercase flex items-center gap-2">
             {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />} {t.backToHub}
           </button>
        </div>
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-slate-100 text-center">
          <div className="bg-blue-100 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-inner">
            <Route size={56} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 leading-tight">{t.personalize}</h2>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">{t.whatInterested}</p>
          
          <div className="grid grid-cols-1 gap-4 mb-10">
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
            onClick={handleGeneratePath}
            disabled={progress.selectedInterests.length === 0}
            className="!py-6 !text-2xl !rounded-3xl shadow-xl shadow-blue-100"
          >
            <Sparkles size={28} /> {t.createPath}
          </Button>
        </div>
      </div>
    );
  }

  // Journey View
  if (hubMode === 'JOURNEY') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
           <button onClick={() => setHubMode('LIBRARY')} className="text-slate-400 font-black text-sm uppercase flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
             {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />} {t.backToHub}
           </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Compass size={20} />
              </div>
              <span className="text-blue-600 font-black uppercase tracking-widest text-xs">{t.yourPersonalPath}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">{progress.pathTitle || t.pathTitlePlaceholder}</h2>
            <p className="text-slate-500 text-xl font-medium max-w-xl">{t.adaptivePathDesc}</p>
          </div>
          <button 
            onClick={() => setHubMode('SETUP')}
            className="text-slate-400 font-black text-sm hover:text-blue-600 flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 transition-all hover:bg-slate-50"
          >
            <RefreshCw size={16} /> {t.generateNewPath}
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-blue-50 relative overflow-hidden">
          <div className={`absolute top-0 opacity-5 pointer-events-none ${isRTL ? 'left-0' : 'right-0'} p-8`}>
             <Trophy size={120} />
          </div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{t.lessonsRemaining}</h3>
              <span className="text-4xl font-black text-blue-600">{pathLessons.length - completedInPath}</span>
            </div>
            <div className="text-right">
               <span className="text-blue-600 bg-blue-50 px-4 py-2 rounded-full font-black text-lg border border-blue-100">
                 {Math.round((completedInPath / pathLessons.length) * 100)}%
               </span>
            </div>
          </div>
          <ProgressBar current={completedInPath} total={pathLessons.length} />
        </div>

        <div className="space-y-6 relative py-10">
          <div className={`absolute top-0 bottom-0 w-2 bg-slate-100 rounded-full ${isRTL ? 'right-12 md:right-16' : 'left-12 md:left-16'} z-0 shadow-inner`} />
          {pathLessons.map((lesson, idx) => {
            const isCompleted = progress.completedLessonIds.includes(lesson.id);
            const isNext = !isCompleted && (idx === 0 || progress.completedLessonIds.includes(pathLessons[idx - 1].id));
            const isLocked = !isCompleted && !isNext;
            return (
              <div key={lesson.id} className="relative z-10">
                <button
                  disabled={isLocked}
                  onClick={() => onSelectLesson(lesson.id)}
                  className={`group w-full flex items-center gap-4 md:gap-8 p-2 md:p-4 rounded-[2.5rem] transition-all transform active:scale-95 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-2'}`}
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-8 flex items-center justify-center shrink-0 shadow-lg transition-all ${
                    isCompleted ? 'bg-emerald-500 border-emerald-600 text-white' :
                    isNext ? 'bg-blue-600 border-blue-700 text-white animate-pulse shadow-blue-200' :
                    'bg-white border-slate-200 text-slate-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={40} /> : isLocked ? <Lock size={32} /> : <span className="text-2xl font-black">{idx + 1}</span>}
                  </div>
                  <div className={`flex-1 p-6 md:p-8 rounded-[2.5rem] border-4 transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-100' : isNext ? 'bg-white border-blue-500 shadow-2xl scale-105' : 'bg-white border-slate-50 shadow-sm'}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest truncate">{CATEGORIES.find(c => c.id === lesson.category)?.label}</span>
                          {isCompleted && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm"><Star size={10} fill="currentColor" /> {t.completed}</span>}
                          {isNext && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">{t.startNow}</span>}
                        </div>
                        <h3 className={`text-2xl font-black leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{lesson.title}</h3>
                        <p className="text-base text-slate-500 font-medium leading-relaxed line-clamp-2">{lesson.shortDesc}</p>
                      </div>
                      <div className={`p-4 rounded-2xl shrink-0 hidden sm:block ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isNext ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-300'}`}>{lesson.icon}</div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Library View (DEFAULT)
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-10 px-4 md:px-10" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight">{t.lessonLibrary}</h2>
        <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto">{t.exploreAll}</p>
      </div>

      {/* Journey Entry Point Hero */}
      <div className={`p-1 w-full rounded-[3.5rem] bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer`}
           onClick={() => progress.generatedPathIds ? setHubMode('JOURNEY') : setHubMode('SETUP')}>
        <div className="bg-white rounded-[3.3rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                <Sparkles size={16} /> {t.myJourney}
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                {progress.generatedPathIds ? (progress.pathTitle || t.viewMyJourney) : t.startJourneyHero}
              </h3>
              <p className="text-xl text-slate-500 font-medium">
                {progress.generatedPathIds ? t.adaptivePathDesc : t.startJourneyDesc}
              </p>
              {progress.generatedPathIds && (
                <div className="w-full max-w-sm pt-4">
                   <ProgressBar current={completedInPath} total={pathLessons.length} label={t.overallProgress} />
                </div>
              )}
           </div>
           <Button className="!py-6 !px-12 !text-2xl !rounded-3xl shadow-xl shadow-blue-100 shrink-0">
             {progress.generatedPathIds ? t.viewMyJourney : t.startNow} {isRTL ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
           </Button>
        </div>
      </div>

      {/* Categories & Library Filter */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-slate-100 pb-8">
           <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-3 rounded-2xl text-slate-600"><Layers size={24} /></div>
             <h4 className="text-2xl md:text-3xl font-black text-slate-800">{t.categories}</h4>
           </div>
           <div className="flex flex-wrap justify-center gap-3">
             <button 
               onClick={() => setActiveCategory('ALL')}
               className={`px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${activeCategory === 'ALL' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
             >
               {t.allLessons}
             </button>
             {CATEGORIES.map(cat => (
               <button 
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
               >
                 {cat.label}
               </button>
             ))}
           </div>
        </div>

        {/* Lesson Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLessons.map((lesson) => {
            const isCompleted = progress.completedLessonIds.includes(lesson.id);
            const categoryInfo = CATEGORIES.find(c => c.id === lesson.category);
            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col text-left active:scale-95 h-full"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${categoryInfo?.color || 'bg-slate-100'} group-hover:scale-110 transition-transform`}>
                    {lesson.icon}
                  </div>
                  {isCompleted && (
                    <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 size={14} /> {t.completed}
                    </div>
                  )}
                </div>
                <div className="space-y-3 flex-1">
                   <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                     {categoryInfo?.label}
                   </span>
                   <h5 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                     {lesson.title}
                   </h5>
                   <p className="text-slate-500 font-medium leading-relaxed">
                     {lesson.shortDesc}
                   </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.startNow} {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
