import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Eye } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../i18n/translations';

interface LoadingBarProps {
  progress?: number; 
  message: string;
  lang: Language;
  estimatedDuration?: number; 
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ 
  progress: manualProgress, 
  message, 
  lang, 
  estimatedDuration = 8000, 
  className = "" 
}) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  const [internalProgress, setInternalProgress] = useState(0);

  useEffect(() => {
    if (manualProgress !== undefined) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const k = 2.3 / estimatedDuration; 
      const newProgress = Math.round(100 * (1 - Math.exp(-k * elapsed)));
      setInternalProgress(Math.min(98, newProgress));
    }, 100);
    return () => clearInterval(interval);
  }, [manualProgress, estimatedDuration]);

  const displayProgress = manualProgress !== undefined ? manualProgress : internalProgress;

  return (
    <div className={`w-full max-w-sm bg-white p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] shadow-xl space-y-4 md:space-y-8 text-center mx-auto border border-slate-50 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes scan { 0%, 100% { transform: translateY(-10px) opacity: 0.2; } 50% { transform: translateY(10px) opacity: 1; } }
        .scanner-line { animation: scan 2s ease-in-out infinite; }
      `}</style>
      
      <div className="relative flex justify-center">
        <div className="bg-orange-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-orange-500 relative overflow-hidden shadow-inner">
          <div className="absolute w-full h-0.5 md:h-1 bg-orange-400 scanner-line" />
          <Eye size={32} className="md:w-10 md:h-10" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{message}</h3>
        <p className="text-slate-400 font-bold text-sm md:text-base">{displayProgress > 80 ? t.almostThere : t.preparingAIWorld}</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center items-center gap-2">
          <span className="text-4xl font-black text-orange-600 tabular-nums">{Math.round(displayProgress)}%</span>
        </div>
        <div className="w-full h-8 md:h-12 bg-slate-100 rounded-full overflow-hidden border-2 md:border-4 border-white ring-1 ring-slate-100 relative shadow-inner">
          <div className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out shadow-lg" style={{ width: `${Math.max(5, displayProgress)}%` }} />
        </div>
      </div>
    </div>
  );
};
