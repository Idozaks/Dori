
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Language } from '../types';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { UI_STRINGS } from '../i18n/translations';
import { generateImage } from '../services/geminiService';
import { 
  ChevronLeft, ChevronRight, Sparkles, Send, Search, Navigation, Info, Globe, 
  QrCode, FileText, MessageSquare, UserPlus, X, Star, UtensilsCrossed, Coffee, Plus, 
  ShoppingBag, Eye, ThumbsUp, MessageCircle, Heart, Camera, Lock, Mic, MicOff, Video, VideoOff,
  MoreVertical, ExternalLink
} from 'lucide-react';

interface LessonDetailViewProps {
  lesson: Lesson;
  onFinish: (id: string) => void;
  onBack: () => void;
  lang: Language;
}

type QrAction = 'MENU' | 'REVIEWS' | 'WAITLIST' | null;

const BirdAssistant: React.FC<{ state?: 'happy' | 'thinking' | 'talking' }> = ({ state = 'happy' }) => (
  <div className="relative w-24 h-24 bird-container">
    <style>{`
      .bird-container { animation: float 3s ease-in-out infinite; }
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      .bird-body { background: #f97316; border-radius: 50% 50% 40% 40%; position: relative; width: 100%; height: 100%; box-shadow: inset -8px -8px 0 rgba(0,0,0,0.1); border: 3px solid #7c2d12; }
      .bird-eye { background: #fff; border-radius: 50%; width: 20px; height: 20px; position: absolute; top: 25%; left: 20%; border: 2px solid #7c2d12; overflow: hidden; }
      .bird-pupil { background: #000; border-radius: 50%; width: 8px; height: 8px; position: absolute; top: 30%; left: 30%; }
      .bird-eye.right { left: 60%; }
      .bird-beak { background: #fbbf24; width: 24px; height: 16px; border-radius: 0 0 100% 100%; position: absolute; top: 45%; left: 50%; transform: translateX(-50%); border: 2px solid #7c2d12; }
      ${state === 'thinking' ? '.bird-eye { height: 4px; margin-top: 8px; }' : ''}
    `}</style>
    <div className="bird-body">
      <div className="bird-eye"><div className="bird-pupil" /></div>
      <div className="bird-eye right"><div className="bird-pupil" /></div>
      <div className="bird-beak" />
    </div>
  </div>
);

const MENU_DATA = {
  en: {
    title: "Dori's Garden Café",
    sections: [
      {
        name: "Popular Starters",
        items: [
          { name: "Salade Niçoise", price: "$12", desc: "Fresh greens, tuna, boiled eggs, olives and house dressing.", icon: "🥗" },
          { name: "Tomato Basil Soup", price: "$9", desc: "Warm, creamy soup served with crusty bread.", icon: "🥣" }
        ]
      }
    ]
  },
  he: {
    title: "קפה הגן של דורי",
    sections: [
      {
        name: "מנות פופולריות",
        items: [
          { name: "סלט ניסואז", price: "₪42", desc: "טונה, ביצה קשה, תפוחי אדמה וירקות טריים ברוטב הבית.", icon: "🥗" },
          { name: "מרק עגבניות ובזיליקום", price: "₪34", desc: "מרק קרמי וחם מוגש עם לחם פריך.", icon: "🥣" }
        ]
      }
    ]
  }
};

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({ lesson, onFinish, onBack, lang }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  
  const [stepIndex, setStepIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  
  // Interaction States
  const [pos, setPos] = useState({ x: 50, y: 75 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [qrActiveAction, setQrActiveAction] = useState<QrAction>(null);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [showQrToast, setShowQrToast] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  
  const [mapSearch, setMapSearch] = useState('');
  const [mapIframeUrl, setMapIframeUrl] = useState<string | null>(null);
  const [mapHasResult, setMapHasResult] = useState(false);
  
  const [emailTo, setEmailTo] = useState('');
  const [emailSub, setEmailSub] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const [socialLiked, setSocialLiked] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchSuccess, setSearchSuccess] = useState(false);
  
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [activeTarget, setActiveTarget] = useState<any>(null);
  const [lensSuccess, setLensSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const step = lesson.steps[stepIndex];
  const isLastStep = stepIndex === lesson.steps.length - 1;

  useEffect(() => {
    const interaction = step.interactiveType;
    if ((interaction === 'SIMULATED_QR' || interaction === 'SIMULATED_SOCIAL' || interaction === 'SIMULATED_LENS') && !bgImage && !isGeneratingImg) {
      const fetchImages = async () => {
        setIsGeneratingImg(true);
        try {
          const prompt = step.interactiveData?.backgroundPrompt || (interaction === 'SIMULATED_QR' 
            ? "A wooden restaurant table with a menu." 
            : interaction === 'SIMULATED_SOCIAL' ? "A happy family photo." : "A lush garden.");
          const img = await generateImage(prompt, '1K');
          setBgImage(img);
        } catch (e) { console.error(e); }
        finally { setIsGeneratingImg(false); }
      };
      fetchImages();
    }
  }, [step]);

  useEffect(() => {
    if (micOn && videoOn) {
      setTimeout(() => setCallConnected(true), 1500);
    }
  }, [micOn, videoOn]);

  const handleNext = () => {
    if (isLastStep) onFinish(lesson.id);
    else {
      setStepIndex(prev => prev + 1);
      setQuizAnswer(null);
      setQuizCorrect(null);
      setQrSuccess(false);
      setEmailSent(false);
      setMapHasResult(false);
      setSocialLiked(false);
      setBgImage(null);
      setSearchSuccess(false);
      setMicOn(false);
      setVideoOn(false);
      setCallConnected(false);
      setCheckoutDone(false);
      setActiveTarget(null);
      setLensSuccess(false);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
    setPos({ x, y });

    if (step.interactiveType === 'SIMULATED_QR') {
      const distance = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 40, 2));
      if (distance < 7 && !qrSuccess) {
        setQrSuccess(true);
        setShowQrToast(true);
        setTimeout(() => setShowQrToast(false), 3000);
      }
    } else if (step.interactiveType === 'SIMULATED_LENS') {
      const targets = step.interactiveData?.targets || [];
      let found = null;
      targets.forEach((t: any) => {
        const d = Math.sqrt(Math.pow(x - t.x, 2) + Math.pow(y - t.y, 2));
        if (d < 10) found = t;
      });
      setActiveTarget(found);
      if (found) setLensSuccess(true);
    }
  };

  const checkSearch = () => {
    if (searchInput.trim().length >= 2) setSearchSuccess(true);
  };

  const handleMapSearch = () => {
    if (!mapSearch.trim()) return;
    setMapIframeUrl(`https://www.google.com/maps?q=${encodeURIComponent(mapSearch)}&output=embed`);
    setMapHasResult(true);
  };

  const renderInteractive = () => {
    switch (step.interactiveType) {
      case 'SIMULATED_SOCIAL':
        return (
          <div className="mt-10 bg-white rounded-[2rem] border-4 border-slate-200 shadow-xl overflow-hidden max-w-lg mx-auto">
            <div className="bg-[#1877F2] p-4 flex items-center justify-between text-white">
              <span className="font-black text-2xl">f</span>
              <Search size={20} />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold">JS</div>
                <span className="font-black text-slate-800">Jane Smith</span>
              </div>
              <p className="text-lg text-slate-700 mb-4">{lang === 'en' ? "Look at little Timmy! 😍" : "תראו את טימי הקטן! 😍"}</p>
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-200">
                {bgImage ? <img src={bgImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Camera className="text-slate-300" /></div>}
              </div>
              <div className="flex gap-4 border-t pt-4">
                <button onClick={() => setSocialLiked(true)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black ${socialLiked ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}><ThumbsUp size={20} /> {lang === 'en' ? 'Like' : 'לייק'}</button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-500 font-bold"><MessageCircle size={20} /> {lang === 'en' ? 'Comment' : 'תגובה'}</button>
              </div>
            </div>
          </div>
        );
      case 'SIMULATED_EMAIL':
        return (
          <div className="mt-10 bg-white rounded-[2rem] border-4 border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-800 p-3 text-white text-sm font-bold flex justify-center uppercase tracking-widest">{lang === 'en' ? 'New Message' : 'הודעה חדשה'}</div>
            <div className="p-6 space-y-4">
              <input className="w-full border-b-2 border-slate-100 py-3 outline-none text-xl font-bold" placeholder={lang === 'en' ? 'To: example@mail.com' : 'אל:'} value={emailTo} onChange={e => setEmailTo(e.target.value)} />
              <input className="w-full border-b-2 border-slate-100 py-3 outline-none text-xl font-bold" placeholder={lang === 'en' ? 'Subject' : 'נושא'} value={emailSub} onChange={e => setEmailSub(e.target.value)} />
              <textarea className="w-full h-40 bg-slate-50 rounded-xl p-4 outline-none text-xl" placeholder={lang === 'en' ? 'Type message here...' : 'כתבו כאן...'} value={emailBody} onChange={e => setEmailBody(e.target.value)} />
              <Button onClick={() => setEmailSent(true)} disabled={!emailTo || !emailSub || !emailBody} fullWidth className="!bg-blue-600 !py-5 !text-2xl"><Send /> {lang === 'en' ? 'Send' : 'שליחה'}</Button>
            </div>
          </div>
        );
      case 'SIMULATED_MAP':
        return (
          <div className="mt-10 bg-white rounded-[2.5rem] border-4 border-slate-200 shadow-xl overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-4 flex gap-2 border-b bg-slate-50">
              <div className="flex-1 flex items-center bg-white rounded-xl border-2 border-slate-300 shadow-inner px-4 focus-within:border-blue-500">
                <Search className="text-slate-400 mr-2" />
                <input 
                  type="text" 
                  value={mapSearch} 
                  onChange={e => setMapSearch(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleMapSearch()}
                  className="w-full py-4 outline-none font-bold text-xl text-slate-800 placeholder:text-slate-400" 
                  placeholder={lang === 'en' ? 'Search Maps...' : 'חפש במפות...'} 
                />
              </div>
              <Button onClick={handleMapSearch} className="!p-4 !bg-blue-600"><Navigation /></Button>
            </div>
            <div className="flex-1 bg-slate-50 relative">
              {mapIframeUrl ? <iframe src={mapIframeUrl} className="w-full h-full border-0" /> : <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-slate-400 font-bold"><Globe size={64} className="mb-4" />{lang === 'en' ? 'Search for a place to see the map' : 'חפשו מקום כדי לראות מפה'}</div>}
            </div>
          </div>
        );
      case 'SIMULATED_SEARCH':
        return (
          <div className="mt-10 bg-white rounded-[2.5rem] border-4 border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
            {searchSuccess ? (
              <div className="animate-fade-in flex flex-col h-full bg-[#f8f9fa]">
                {/* Search Bar Top */}
                <div className="bg-white border-b p-4 sm:px-10 flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-2xl font-black shrink-0"><span className="text-blue-600">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-600">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></div>
                  <div className="w-full max-w-2xl bg-white border-2 border-slate-200 rounded-full px-6 py-2 shadow-sm flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-800">{searchInput}</span>
                    <Search className="text-blue-600" size={20} />
                  </div>
                </div>
                
                {/* Search Results Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8">
                  {/* AI Overview Box */}
                  <div className="bg-gradient-to-br from-[#f8faff] to-[#eff4ff] border border-blue-100 rounded-[2rem] p-6 sm:p-8 shadow-sm ring-1 ring-blue-50">
                    <div className="flex items-center gap-2 mb-4 text-blue-700 font-black tracking-tight text-xl">
                      <Sparkles size={24} className="fill-blue-600" />
                      {lang === 'en' ? 'AI Overview' : 'סקירת AI'}
                    </div>
                    <div className="text-xl sm:text-2xl text-slate-800 leading-relaxed space-y-4">
                      <p>
                        {lang === 'en' 
                          ? `The weather today is pleasant with clear skies. For the most up-to-date local forecast, look at official weather service links below.`
                          : `מזג האוויר היום נעים עם שמיים בהירים. לתחזית המקומית המעודכנת ביותר, כדאי לעיין בקישורים הרשמיים המופיעים למטה.`}
                      </p>
                      <ul className="list-disc pl-8 space-y-2 opacity-90">
                        <li>{lang === 'en' ? 'Current Temperature: 22°C' : 'טמפרטורה נוכחית: 22°C'}</li>
                        <li>{lang === 'en' ? 'Humidity: 45%' : 'לחות: 45%'}</li>
                      </ul>
                    </div>
                    <div className="mt-6 pt-6 border-t border-blue-200/50 flex items-center gap-4">
                       <div className="bg-white px-4 py-2 rounded-full border border-blue-100 text-sm font-bold text-blue-700">{lang === 'en' ? 'Check 10-day forecast' : 'בדוק תחזית ל-10 ימים'}</div>
                       <div className="bg-white px-4 py-2 rounded-full border border-blue-100 text-sm font-bold text-blue-700">{lang === 'en' ? 'UV Index' : 'מדד UV'}</div>
                    </div>
                  </div>

                  {/* Standard Results */}
                  <div className="space-y-10">
                    {[
                      { title: lang === 'en' ? 'Local Weather Forecast - Official' : 'תחזית מזג אוויר מקומית - רשמי', url: 'https://weather.service.gov' },
                      { title: lang === 'en' ? 'Weather Highlights and News' : 'חדשות מזג אוויר ועדכונים', url: 'https://news-weather.com' }
                    ].map((res, i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">{res.url} <MoreVertical size={14} /></div>
                        <h4 className="text-2xl font-bold text-blue-700 group-hover:underline mb-2">{res.title}</h4>
                        <p className="text-lg text-slate-600 leading-snug">{lang === 'en' ? 'Get the latest weather news, radar maps, and live updates.' : 'קבלו את חדשות מזג האוויר האחרונות, מפות מכ"ם ועדכונים חיים.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center h-full">
                <h1 className="text-6xl sm:text-8xl font-black tracking-tight mb-12"><span className="text-blue-600">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-600">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></h1>
                <div className="w-full max-w-xl relative">
                  <input 
                    type="text" 
                    value={searchInput} 
                    onChange={e => setSearchInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && checkSearch()} 
                    placeholder={step.interactiveData.placeholder} 
                    className="w-full pl-14 pr-6 py-6 rounded-full border-2 border-slate-200 text-2xl text-slate-900 shadow-xl focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                    style={{ textAlign: isRTL ? 'right' : 'left' }} 
                  />
                  <Search size={32} className={`absolute ${isRTL ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-300`} />
                </div>
                <div className="mt-10 flex gap-4">
                  <Button onClick={checkSearch} className="!rounded-full !px-8 !py-4 !bg-slate-50 !text-slate-700 !border-0 !shadow-none hover:!bg-slate-100">{lang === 'en' ? 'Google Search' : 'חיפוש בגוגל'}</Button>
                  <Button className="!rounded-full !px-8 !py-4 !bg-slate-50 !text-slate-700 !border-0 !shadow-none hover:!bg-slate-100">{lang === 'en' ? "I'm Feeling Lucky" : 'יותר מזל משכל'}</Button>
                </div>
              </div>
            )}
          </div>
        );
      case 'SIMULATED_VIDEO_CALL':
        return (
          <div className="mt-10 bg-slate-900 rounded-[3rem] p-8 text-center aspect-video flex flex-col justify-center items-center gap-8 shadow-2xl">
            <div className="flex gap-8">
              <button onClick={() => setMicOn(!micOn)} className={`w-20 h-20 rounded-full flex items-center justify-center ${micOn ? 'bg-blue-600' : 'bg-red-500 animate-pulse'}`}>{micOn ? <Mic size={32} /> : <MicOff size={32} />}</button>
              <button onClick={() => setVideoOn(!videoOn)} className={`w-20 h-20 rounded-full flex items-center justify-center ${videoOn ? 'bg-blue-600' : 'bg-red-500 animate-pulse'}`}>{videoOn ? <Video size={32} /> : <VideoOff size={32} />}</button>
            </div>
            {callConnected ? <h3 className="text-white text-3xl font-black">{lang === 'en' ? 'Call Connected!' : 'שיחה מחוברת!'}</h3> : <p className="text-slate-400 font-bold">{lang === 'en' ? 'Turn on Mic and Video to connect' : 'הפעילו מיקרופון ווידאו כדי להתחבר'}</p>}
          </div>
        );
      case 'SECURE_CHECKOUT':
        return (
          <div className="mt-10 bg-white p-8 rounded-3xl border-4 border-slate-200 shadow-xl max-w-md mx-auto">
            <div className="flex items-center gap-2 text-green-600 font-black mb-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-green-100"><Lock size={20} /> HTTPS://SECURE-PAY.COM</div>
            <h3 className="text-2xl font-black mb-6">{lang === 'en' ? 'Order Summary' : 'סיכום הזמנה'}</h3>
            <div className="space-y-2 mb-8 text-xl font-bold">
               <div className="flex justify-between"><span>Items:</span><span>$24.00</span></div>
               <div className="flex justify-between border-t pt-2 text-blue-700"><span>Total:</span><span>$24.00</span></div>
            </div>
            {checkoutDone ? <div className="p-4 bg-green-50 text-green-700 rounded-xl font-black text-center animate-bounce">Payment Successful!</div> : <Button fullWidth onClick={() => setCheckoutDone(true)} className="!bg-green-600">Pay Now</Button>}
          </div>
        );
      case 'SIMULATED_LENS':
        return (
          <div className="mt-10 space-y-6">
            <div className="bg-slate-200 rounded-[2.5rem] border-4 overflow-hidden relative aspect-square flex items-center justify-center cursor-grab" ref={containerRef} onMouseMove={handleMove} onTouchMove={handleMove} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)}>
              {bgImage && <img src={bgImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
              <div className="absolute pointer-events-none transition-transform z-20" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -50%)` }}>
                <div className={`w-32 h-32 rounded-full border-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all ${activeTarget ? 'border-green-500 scale-110' : 'border-white/50 scale-100'}`}>
                  <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                </div>
              </div>
              {activeTarget && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-xl border-2 border-green-500 animate-bounce">
                  <span className="font-black text-xl">{activeTarget.label}</span>
                </div>
              )}
            </div>
            {!lensSuccess && <p className="text-center font-bold text-slate-500">{lang === 'en' ? 'Drag the lens over the scene' : 'גררו את העדשה מעל הסצנה'}</p>}
          </div>
        );
      case 'SIMULATED_QR':
        return (
          <div className="mt-10 space-y-8">
            <div className="bg-slate-200 rounded-[2.5rem] border-4 border-slate-300 overflow-hidden relative aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing select-none" ref={containerRef} onMouseMove={handleMove} onTouchMove={handleMove} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)}>
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl"><QrCode size={120} className="text-slate-900" /></div>
              <div className={`absolute pointer-events-none transition-transform duration-75 z-20`} style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -50%)` }}>
                <div className={`w-32 h-56 bg-slate-900 rounded-[1.5rem] border-4 shadow-2xl flex flex-col ring-4 ${qrSuccess ? 'border-green-500 ring-green-400' : 'border-slate-800 ring-white/10'}`}>
                  <div className="flex-1 bg-black/40 m-2 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 border-2 border-white/20 m-2" />
                  </div>
                </div>
              </div>
            </div>
            {qrSuccess && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                <button onClick={() => setQrActiveAction('MENU')} className="bg-white p-6 rounded-2xl border-4 border-blue-100 hover:border-blue-500 transition-all flex flex-col items-center gap-3"><FileText size={32} /> <span className="font-black">{lang === 'en' ? 'Menu' : 'תפריט'}</span></button>
                <button onClick={() => setQrActiveAction('REVIEWS')} className="bg-white p-6 rounded-2xl border-4 border-amber-100 hover:border-amber-500 transition-all flex flex-col items-center gap-3"><MessageCircle size={32} /> <span className="font-black">{lang === 'en' ? 'Reviews' : 'ביקורות'}</span></button>
                <button onClick={() => setQrActiveAction('WAITLIST')} className="bg-white p-6 rounded-2xl border-4 border-emerald-100 hover:border-emerald-500 transition-all flex flex-col items-center gap-3"><UserPlus size={32} /> <span className="font-black">{lang === 'en' ? 'Waitlist' : 'תור'}</span></button>
              </div>
            )}
            {qrActiveAction === 'MENU' && (
              <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-xl rounded-[2rem] overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b flex justify-between items-center font-black"><span>{lang === 'en' ? 'Menu' : 'תפריט'}</span> <button onClick={() => setQrActiveAction(null)}><X /></button></div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {MENU_DATA[lang as keyof typeof MENU_DATA]?.sections[0].items.map((item, i) => (
                      <div key={i} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border-2 border-transparent hover:border-blue-200">
                        <span className="text-4xl">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between font-black"><h5 className="text-xl">{item.name}</h5><span>{item.price}</span></div>
                          <p className="text-slate-500 text-lg">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'QUIZ':
        return (
          <div className="mt-10 space-y-4">
            <h4 className="text-2xl font-black mb-6">{step.interactiveData.question}</h4>
            {step.interactiveData.options.map((opt: string, i: number) => (
              <button key={i} onClick={() => { setQuizAnswer(i); setQuizCorrect(i === step.interactiveData.correctIndex); }} className={`w-full p-6 rounded-2xl border-4 text-left font-black text-xl ${quizAnswer === i ? (quizCorrect ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50') : 'bg-slate-50 border-transparent hover:border-slate-200'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>{opt}</button>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between px-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-black text-xl">{isRTL ? <ChevronRight /> : <ChevronLeft />} {t.backToHub}</button>
        <span className="text-slate-400 font-black uppercase tracking-widest">{t.step} {stepIndex + 1} {t.of} {lesson.steps.length}</span>
      </div>
      <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl border-4 border-slate-50 relative">
        <div className="absolute top-[-40px] right-[-20px] hidden lg:block"><BirdAssistant state={isDragging ? 'thinking' : 'talking'} /></div>
        <ProgressBar current={stepIndex + 1} total={lesson.steps.length} />
        <div className="mt-12">
          <h2 className="text-4xl font-black text-slate-800 mb-6">{step.title}</h2>
          <div className="text-2xl text-slate-700 leading-relaxed mb-10">{step.content}</div>
          {renderInteractive()}
        </div>
        <div className="mt-16 flex justify-between pt-10 border-t-2">
          <Button variant="secondary" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>{isRTL ? <ChevronRight /> : <ChevronLeft />} {t.prev}</Button>
          <Button onClick={handleNext} disabled={
            (step.interactiveType === 'QUIZ' && !quizCorrect) || 
            (step.interactiveType === 'SIMULATED_QR' && !qrSuccess) || 
            (step.interactiveType === 'SIMULATED_EMAIL' && !emailSent) || 
            (step.interactiveType === 'SIMULATED_MAP' && !mapHasResult) || 
            (step.interactiveType === 'SIMULATED_SOCIAL' && !socialLiked) ||
            (step.interactiveType === 'SIMULATED_SEARCH' && !searchSuccess) ||
            (step.interactiveType === 'SIMULATED_VIDEO_CALL' && !callConnected) ||
            (step.interactiveType === 'SECURE_CHECKOUT' && !checkoutDone) ||
            (step.interactiveType === 'SIMULATED_LENS' && !lensSuccess)
          } className="!px-10 !py-5 !rounded-2xl !text-2xl">{isLastStep ? t.finish : t.next} {isRTL ? <ChevronLeft /> : <ChevronRight />}</Button>
        </div>
      </div>
    </div>
  );
};
