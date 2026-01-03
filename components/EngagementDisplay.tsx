
import React from 'react';
import { Flame, Award, Lightbulb, CheckCircle2 } from 'lucide-react';
import { UI_STRINGS } from '../i18n/translations';
import { Language, UserAccount } from '../types';

interface EngagementDisplayProps {
    user: UserAccount;
    lang: Language;
}

export const EngagementDisplay: React.FC<EngagementDisplayProps> = ({ user, lang }) => {
    const t = UI_STRINGS[lang];
    const isRTL = lang === 'he' || lang === 'ar';

    const streakCount = user.streakCount || 0;
    const badges = user.earnedBadges || [];

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Streak Card */}
                <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 rounded-[2.5rem] shadow-lg text-white relative overflow-hidden group">
                    <div className="absolute top-[-10%] right-[-10%] opacity-10 group-hover:scale-110 transition-transform">
                        <Flame size={120} />
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                            <Flame size={32} />
                        </div>
                        <div>
                            <p className="text-orange-100 font-black uppercase text-[10px] tracking-widest">{t.dailyStreak}</p>
                            <h3 className="text-3xl font-black">{streakCount} {t.days}</h3>
                        </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-orange-50/80">{t.keepTheStreak}</p>
                </div>

                {/* Tip Card */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-yellow-100 relative overflow-hidden group">
                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-600">
                            <Lightbulb size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-800 mb-1">{t.dailyTipTitle}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">{t.dailyTipContent}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            {badges.length > 0 && (
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-blue-50">
                    <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                        <Award size={32} className="text-blue-600" /> {t.earnedBadgesTitle}
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {badges.map((badgeId) => (
                            <div key={badgeId} className="flex flex-col items-center gap-2 group">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100 text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                                    <Award size={40} />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center max-w-[80px]">
                                    {t.badges[badgeId] || badgeId}
                                </span>
                                <div className="mt-[-12px] bg-green-500 text-white rounded-full p-0.5 shadow-sm border border-white">
                                    <CheckCircle2 size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
