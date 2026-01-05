import React, { useState } from 'react';
import { UI_STRINGS } from '../i18n/translations';
import { Language, UserAccount } from '../types';
import { ShieldCheck, Cpu, Sparkles, ChevronRight, GraduationCap } from 'lucide-react';

// Use the local Avatar definition or imported one
const Avatar = ({ seed, className }: { seed: string, className?: string }) => {
  const isDoris = seed === 'doris';
  const isSolomon = seed === 'solomon';
  const isGoldie = seed === 'goldie';
  const isVictor = seed === 'victor';
  
  return (
    <div className={`aspect-square overflow-hidden bg-white rounded-full flex items-center justify-center ${className}`}>
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
      {isVictor && (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#ffedd5" />
          <path d="M50 78c-11 0-20-9-20-20V42c0-11 9-20 20-20s20 9 20 20v16c0 11-9 20-20 20z" fill="#ffdbac" />
          <path d="M32 40c0-10 10-18 18-18s18 8 18 18v2c0-10-8-15-18-15s-18 5-18 15v-2z" fill="#e2e8f0" />
          <g>
            <circle cx="41" cy="48" r="2" fill="#333" />
            <circle cx="59" cy="48" r="2" fill="#333" />
          </g>
          <path d="M44 65q6 4 12 0" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M25 100c0-10 10-18 25-18s25 8 25 18H25z" fill="#065f46" />
        </svg>
      )}
      {!isDoris && !isSolomon && !isGoldie && !isVictor && (
        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-6xl">
          {seed.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

interface LandingViewProps {
  onLogin: (account: UserAccount) => void;
  lang: Language;
  accounts: UserAccount[];
}

export const LandingView: React.FC<LandingViewProps> = ({ onLogin, lang, accounts }) => {
  const t = UI_STRINGS[lang];
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleProfileSelect = (account: UserAccount) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      onLogin(account);
    }, 1000);
  };

  const isRTL = lang === 'he' || lang === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="relative pt-20 pb-12 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm border border-blue-100">
            <Sparkles size={20} className="text-blue-500" />
            <span className="text-blue-600 font-black tracking-widest uppercase text-sm">{t.welcome}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">{t.landingHeroTitle}</h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">{t.landingHeroSubtitle}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-4 border-blue-100/50 relative">
          <h2 className="text-4xl font-black text-slate-900 mb-4 text-center">{t.whoIsLearning}</h2>
          <p className="text-xl text-slate-500 font-bold mb-12 text-center">{t.selectProfile}</p>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {accounts.map(account => {
              const accountId = account.id.toLowerCase();
              let tag = '';
              let desc = '';
              if (accountId.includes('doris')) { tag = t.dorisTag; desc = t.dorisDesc; }
              else if (accountId.includes('solomon')) { tag = t.solomonTag; desc = t.solomonDesc; }
              else if (accountId.includes('goldie')) { tag = t.goldieTag; desc = t.goldieDesc; }
              else if (accountId.includes('victor')) { tag = t.victorTag; desc = t.victorDesc; }

              return (
                <button
                  key={account.id}
                  onClick={() => handleProfileSelect(account)}
                  className="group relative flex flex-col items-center p-6 rounded-[2.5rem] bg-slate-50 border-4 border-transparent hover:border-blue-500 hover:bg-white transition-all transform hover:-translate-y-2 active:scale-95 shadow-xl text-center"
                >
                  <Avatar seed={account.avatar} className="w-28 h-28 rounded-[2rem] mb-4 border-4 border-white shadow-xl group-hover:rotate-3 transition-transform" />
                  <div className="mb-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-2">
                      <GraduationCap size={12} /> {tag}
                    </span>
                    <h3 className="text-2xl font-black text-slate-800">{account.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4 h-12 overflow-hidden">{desc}</p>
                  <div className="w-full pt-4 border-t border-slate-200 flex items-center justify-between mt-auto">
                    <div className="flex flex-col items-start">
                      <span className="text-xl font-black text-blue-600">{account.completedLessonIds.length}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lessons}</span>
                    </div>
                    <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
                      <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 hover:border-blue-200 transition-all">
            <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center text-emerald-600 mb-8 shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">{t.feature1Title || 'Safe Learning'}</h3>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">{t.feature1Desc || 'Learn in a safe, simulated environment without any risk.'}</p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 hover:border-purple-200 transition-all">
            <div className="bg-purple-100 w-20 h-20 rounded-3xl flex items-center justify-center text-purple-600 mb-8 shadow-inner">
              <Sparkles size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">{t.feature2Title || 'AI Companion'}</h3>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">{t.feature2Desc || 'Dori is always here to answer your questions simply.'}</p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 hover:border-orange-200 transition-all">
            <div className="bg-orange-100 w-20 h-20 rounded-3xl flex items-center justify-center text-orange-600 mb-8 shadow-inner">
              <Cpu size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">{t.feature3Title || 'Real-world Skills'}</h3>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">{t.feature3Desc || 'Master bureaucracy, shopping, and communication tools.'}</p>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
        <p>&copy; {new Date().getFullYear()} Dori AI • {t.welcome}</p>
      </footer>
    </div>
  );
};