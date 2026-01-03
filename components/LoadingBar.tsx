
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../i18n/translations';

interface LoadingBarProps {
  progress: number;
  message: string;
  lang: Language;
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ progress, message, lang, className = "" }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';

  return (
    <div className={`w-full max-w-md bg-white p-10 sm:p-12 rounded-[3.5rem] shadow-2xl space-y-8 text-center mx-auto border border-slate-100 animate-fade-in-lesson ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes fade-in-lesson {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-lesson {
          animation: fade-in-lesson 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .progress-bar-shadow {
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.06);
        }
      `}</style>
      
      {/* Icon Area */}
      <div className="relative flex justify-center pb-2">
        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
          <Sparkles size={56} className="animate-spin-slow" />
        </div>
      </div>

      {/* Text Info */}
      <div className="space-y-4">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
          {message}
        </h3>
        <p className="text-slate-500 font-bold text-lg leading-snug max-w-[280px] mx-auto opacity-80">
          {t.preparingAIWorld}
        </p>
      </div>

      {/* Progress Area */}
      <div className="space-y-6 pt-4">
        <div className="flex justify-center items-center gap-2">
          <span className="text-blue-600 font-black text-2xl uppercase tracking-widest">
            {t.progressPercentage}:
          </span>
          <span className="text-4xl font-black text-blue-600 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="w-full h-12 bg-slate-100 rounded-full overflow-hidden border-4 border-white ring-1 ring-slate-200/50 progress-bar-shadow relative">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${Math.max(2, progress)}%` }} 
          />
        </div>

        {progress >= 99 && (
          <div className="animate-bounce-in pt-4">
            <div className="inline-block bg-emerald-50 text-emerald-600 px-8 py-3 rounded-full font-black text-2xl border-2 border-emerald-100 shadow-sm">
              {t.complete}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
