
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Language } from '../types';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { UI_STRINGS } from '../i18n/translations';
import { generateImage } from '../services/geminiService';
import { 
  ChevronLeft, ChevronRight, Sparkles, Send, Search, Mic, MicOff, Video, VideoOff, 
  PhoneOff, Lock, Unlock, QrCode, MapPin, Navigation, Map as MapIcon, Info, Globe, 
  Camera, Smartphone, Move, Loader2, AlertCircle, CheckCircle2, Focus, Hand,
  FileText, MessageSquare, UserPlus, X, Star, UtensilsCrossed, Coffee, Plus, ShoppingBag, Eye
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
      .bird-wing { background: #f97316; width: 30px; height: 40px; border-radius: 50%; position: absolute; top: 30%; left: -15px; border: 2px solid #7c2d12; transform: rotate(-20deg); }
      .bird-wing.right { left: auto; right: -15px; transform: rotate(20deg); }
      ${state === 'thinking' ? '.bird-eye { height: 4px; margin-top: 8px; }' : ''}
      ${state === 'talking' ? '.bird-beak { height: 24px; }' : ''}
    `}</style>
    <div className="bird-wing" />
    <div className="bird-wing right" />
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
          { name: "Garden Salad", price: "$12", desc: "Fresh greens, cherry tomatoes, cucumbers with house dressing.", icon: "🥗" },
          { name: "Tomato Basil Soup", price: "$9", desc: "Warm, creamy soup served with crusty bread.", icon: "🥣" }
        ]
      },
      {
        name: "Main Course",
        items: [
          { name: "Classic Roast Chicken", price: "$24", desc: "Tender chicken served with roasted potatoes and seasonal vegetables.", icon: "🍗" },
          { name: "Grilled Atlantic Salmon", price: "$28", desc: "Served with a lemon butter sauce and steamed asparagus.", icon: "🐟" },
          { name: "Wild Mushroom Lasagna", price: "$21", desc: "Layers of pasta with creamy mushroom filling and mozzarella.", icon: "🍝" }
        ]
      },
      {
        name: "Drinks & Coffee",
        items: [
          { name: "Fresh Lemonade", price: "$5", desc: "Homemade with real lemons and a touch of mint.", icon: "🍋" },
          { name: "Artisan Coffee", price: "$4", desc: "Locally roasted beans, choice of milk.", icon: "☕" }
        ]
      }
    ]
  },
  he: {
    title: "קפה הגן של דורי",
    sections: [
      {
        name: "מנות ראשונות",
        items: [
          { name: "סלט גינה", price: "₪42", desc: "ירקות טריים, עגבניות שרי ומלפפונים ברוטב הבית.", icon: "🥗" },
          { name: "מרק עגבניות ובזיליקום", price: "₪34", desc: "מרק קרמי וחם מוגש עם לחם פריך.", icon: "🥣" }
        ]
      },
      {
        name: "מנות עיקריות",
        items: [
          { name: "עוף צלוי קלאסי", price: "₪82", desc: "עוף רך מוגש עם תפוחי אדמה צלויים וירקות העונה.", icon: "🍗" },
          { name: "סלמון אטלנטי בגריל", price: "₪94", desc: "מוגש ברוטב חמאת לימון ואספרגוס מאודה.", icon: "🐟" },
          { name: "לזניית פטריות יער", price: "₪72", desc: "שכבות פסטה עם מילוי פטריות קרמי ומוצרלה.", icon: "🍝" }
        ]
      },
      {
        name: "שתייה חמה וקרה",
        items: [
          { name: "לימונדה טרייה", price: "₪18", desc: "תוצרת בית עם לימונים אמיתיים ונגיעה של נענע.", icon: "🍋" },
          { name: "קפה ארטיזן", price: "₪14", desc: "פולי קפה בקלייה מקומית, בחירת חלב.", icon: "☕" }
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
  
  // Simulation States
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [callSuccess, setCallSuccess] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [lensSuccess, setLensSuccess] = useState(false);
  const [qrIsInView, setQrIsInView] = useState(false);
  const [showQrToast, setShowQrToast] = useState(false);
  const [voiceHeard, setVoiceHeard] = useState(false);
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'IDLE' | 'CHECKING' | 'SUCCESS'>('IDLE');
  
  // Interaction positions
  const [pos, setPos] = useState({ x: 50, y: 75 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [qrActiveAction, setQrActiveAction] = useState<QrAction>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTarget, setActiveTarget] = useState<any>(null);

  // Map State
  const [mapSearch, setMapSearch] = useState('');
  const [mapIframeUrl, setMapIframeUrl] = useState<string | null>(null);
  const [mapHasResult, setMapHasResult] = useState(false);

  // Email State
  const [emailTo, setEmailTo] = useState('');
  const [emailSub, setEmailSub] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Search State
  const [searchInput, setSearchInput] = useState('');
  const [searchSuccess, setSearchSuccess] = useState(false);

  const step = lesson.steps[stepIndex];
  const isLastStep = stepIndex === lesson.steps.length - 1;

  // Pre-generate background images
  useEffect(() => {
    const interaction = step.interactiveType;
    if ((interaction === 'SIMULATED_QR' || interaction === 'SIMULATED_LENS') && !bgImage && !isGeneratingImg) {
      const fetchImages = async () => {
        setIsGeneratingImg(true);
        setGenError(null);
        try {
          const prompt = step.interactiveData?.backgroundPrompt || 
            (interaction === 'SIMULATED_QR' ? "A textured beige restaurant wall with a white poster frame. Cinematic lighting." : "A lush vector garden Kurzgesagt style.");
          const img = await generateImage(prompt, '1K');
          setBgImage(img);
        } catch (err: any) {
          setGenError("Simplified visuals enabled.");
        } finally {
          setIsGeneratingImg(false);
        }
      };
      fetchImages();
    }
  }, [step, bgImage]);

  useEffect(() => {
    if (micOn && videoOn) {
      const timer = setTimeout(() => setCallSuccess(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [micOn, videoOn]);

  useEffect(() => {
    setPos({ x: 50, y: 75 });
    setIsDragging(false);
    setQrIsInView(false);
    setQrActiveAction(null);
    setLensSuccess(false);
    setActiveTarget(null);
  }, [stepIndex]);

  // Handle advancement to next step or finish
  const handleNext = () => {
    if (isLastStep) {
      onFinish(lesson.id);
    } else {
      setStepIndex(prev => prev + 1);
      // Reset quiz state
      setQuizAnswer(null);
      setQuizCorrect(null);
      // Reset simulation states
      setMicOn(false);
      setVideoOn(false);
      setCallSuccess(false);
      setQrSuccess(false);
      setVoiceHeard(false);
      setVoiceSuccess(false);
      setCheckoutStatus('IDLE');
      setEmailSent(false);
      setSearchSuccess(false);
      setMapHasResult(false);
      setMapIframeUrl(null);
      setMapSearch('');
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    if (e.cancelable) e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));

    setPos({ x: clampedX, y: clampedY });

    if (step.interactiveType === 'SIMULATED_QR') {
      const distance = Math.sqrt(Math.pow(clampedX - 50, 2) + Math.pow(clampedY - 40, 2));
      setQrIsInView(distance < 15);
      if (distance < 7 && !qrSuccess) {
        setQrSuccess(true);
        setShowQrToast(true);
        setTimeout(() => setShowQrToast(false), 4000);
      }
    } else if (step.interactiveType === 'SIMULATED_LENS') {
      const targets = step.interactiveData.targets;
      let found = null;
      targets.forEach((t: any) => {
        const d = Math.sqrt(Math.pow(clampedX - t.x, 2) + Math.pow(clampedY - t.y, 2));
        if (d < 10) found = t;
      });
      setActiveTarget(found);
      if (found) setLensSuccess(true);
    }
  };

  const checkQuiz = (index: number) => {
    setQuizAnswer(index);
    setQuizCorrect(index === step.interactiveData.correctIndex);
  };

  const checkSearch = () => {
    const input = searchInput.toLowerCase();
    const keywords = step.interactiveData.targetKeywords;
    const matches = keywords.filter((kw: string) => input.includes(kw.toLowerCase()));
    if (matches.length >= 1) setSearchSuccess(true);
  };

  const handleMapSearch = () => {
    const trimmed = mapSearch.trim();
    if (!trimmed) return;
    const encodedQuery = encodeURIComponent(trimmed);
    const newUrl = `https://www.google.com/maps?q=${encodedQuery}&output=embed&z=15&gestureHandling=greedy`;
    setMapIframeUrl(newUrl);
    if (trimmed.toLowerCase().includes(step.interactiveData.targetSearch.toLowerCase())) {
      setMapHasResult(true);
    }
  };

  const renderDigitalMenu = () => {
    const data = MENU_DATA[lang as keyof typeof MENU_DATA] || MENU_DATA.en;
    return (
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        <div className="bg-slate-900 p-8 text-center text-white relative">
           <div className="absolute top-4 left-4 opacity-20"><Coffee size={40} /></div>
           <div className="absolute bottom-4 right-4 opacity-20"><UtensilsCrossed size={40} /></div>
           <h4 className="text-3xl font-black mb-2 tracking-tight">{data.title}</h4>
           <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs">Digital Ordering Hub</p>
        </div>
        <div className="flex-1 p-6 space-y-10">
          {data.sections.map((section, idx) => (
            <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 border-b-2 border-slate-50 mb-6">
                <h5 className="text-xl font-black text-slate-900">{section.name}</h5>
              </div>
              <div className="space-y-6">
                {section.items.map((item, i) => (
                  <div key={i} className="group p-4 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-blue-200 transition-all flex items-start gap-5">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-4xl shrink-0">{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h6 className="text-xl font-black text-slate-800">{item.name}</h6>
                        <span className="text-lg font-black text-blue-600">{item.price}</span>
                      </div>
                      <p className="text-base text-slate-500 font-medium leading-snug mb-3">{item.desc}</p>
                      <button className="flex items-center gap-2 bg-white border-2 border-slate-200 px-4 py-2 rounded-xl text-sm font-black text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                        <Plus size={16} /> {lang === 'en' ? 'Add to Order' : 'הוספה להזמנה'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-900 m-6 p-5 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-slate-200">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center"><ShoppingBag size={24} /></div>
              <div>
                <p className="font-black text-lg leading-none mb-1">{lang === 'en' ? 'Your Cart' : 'הסל שלך'}</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">0 Items • $0.00</p>
              </div>
           </div>
           <button className="px-6 py-2 bg-white text-slate-900 rounded-xl font-black">{lang === 'en' ? 'Checkout' : 'לתשלום'}</button>
        </div>
      </div>
    );
  };

  const renderInteractive = () => {
    switch (step.interactiveType) {
      case 'SIMULATED_QR':
      case 'SIMULATED_LENS':
        return (
          <div className="mt-10 space-y-8 animate-fade-in">
            <div className="bg-[#e5e1d8] rounded-[2.5rem] border-4 border-slate-300 overflow-hidden shadow-2xl relative aspect-[3/4] sm:aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
                 ref={containerRef}
                 onMouseMove={handleMove}
                 onTouchMove={handleMove}
                 onMouseDown={() => setIsDragging(true)}
                 onMouseUp={() => setIsDragging(false)}
                 onTouchStart={() => setIsDragging(true)}
                 onTouchEnd={() => setIsDragging(false)}
            >
              <div className="absolute inset-0 z-0">
                 {bgImage ? (
                    <img src={bgImage} className={`w-full h-full object-cover pointer-events-none transition-all duration-1000 ${isDragging && step.interactiveType === 'SIMULATED_LENS' ? 'blur-sm scale-110' : ''}`} alt="Simulation Scene" />
                 ) : (
                    <div className="w-full h-full bg-[#dccfb4] opacity-50" style={{ backgroundImage: 'radial-gradient(#bca883 1px, transparent 0)', backgroundSize: '15px 15px' }} />
                 )}
              </div>
              
              {step.interactiveType === 'SIMULATED_QR' && (
                <div className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${qrSuccess ? 'opacity-30 scale-95 grayscale' : 'scale-100 opacity-100'}`}>
                  <div className="bg-[#5a3e2b] p-3 rounded-md shadow-2xl"> 
                    <div className="bg-white px-8 py-10 flex flex-col items-center gap-6 shadow-inner border border-slate-100 min-w-[200px] sm:min-w-[280px]">
                      <h4 className="text-3xl font-black text-green-700 leading-none text-center">{lang === 'he' ? 'סרוק\nלתפריט' : 'SCAN FOR\nMENU'}</h4>
                      <div className="p-3 border-2 border-slate-100 rounded-lg"><QrCode size={100} className="text-slate-900 sm:w-[140px] sm:h-[140px]" /></div>
                    </div>
                  </div>
                </div>
              )}

              {step.interactiveType === 'SIMULATED_LENS' && !isDragging && !lensSuccess && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] text-center max-w-xs shadow-2xl animate-bounce">
                    <BirdAssistant />
                    <p className="mt-4 text-xl font-black text-slate-800">{lang === 'en' ? 'Drag the lens to explore!' : 'גררו את העדשה כדי לחקור!'}</p>
                  </div>
                </div>
              )}

              {/* The Phone Lens */}
              <div 
                className={`absolute pointer-events-none transition-transform duration-75 flex flex-col items-center justify-center z-20 ${isDragging ? 'scale-105' : 'scale-100'}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -50%)` }}
              >
                <div className={`w-32 h-[220px] sm:w-48 sm:h-[320px] bg-slate-900 rounded-[1.5rem] sm:rounded-[2.2rem] border-[5px] sm:border-[6px] shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden ring-4 transition-all duration-300 ${qrIsInView || activeTarget ? 'border-green-500 ring-green-400/60' : 'border-slate-800 ring-white/10'}`}>
                  <div className="h-5 sm:h-7 bg-slate-900 flex items-center justify-center"><div className="h-1 w-6 sm:w-10 rounded-full bg-slate-700" /></div>
                  <div className="flex-1 bg-black/50 relative overflow-hidden">
                    {/* View through the lens - reversed blur for simulation feel */}
                    {bgImage && (
                       <img src={bgImage} className="absolute inset-0 w-[800%] h-[800%] object-cover opacity-100 max-w-none" 
                            style={{ 
                              left: `-${pos.x * 8 - 50}%`, 
                              top: `-${pos.y * 8 - 50}%`,
                              filter: 'contrast(1.2) brightness(1.1)' 
                            }} />
                    )}
                    <div className="absolute inset-0 border-4 border-white/20 rounded-xl m-2" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-white/40 rounded-full border-dashed animate-spin-slow" />
                      <div className="w-2 h-2 bg-red-500 rounded-full absolute animate-pulse" />
                    </div>
                  </div>
                  <div className="h-8 sm:h-10 bg-slate-900 flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-slate-700" /></div>
                </div>
                
                {activeTarget && (
                  <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 animate-[tagPop_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-green-500 flex items-center gap-3 whitespace-nowrap">
                       <div className="bg-green-100 p-2 rounded-lg text-green-600"><Sparkles size={20}/></div>
                       <div>
                         <p className="font-black text-slate-800 leading-none">{activeTarget.label}</p>
                         <p className="text-xs text-slate-500 font-bold mt-1">{activeTarget.desc}</p>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {showQrToast && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-[slideUp_0.5s_ease-out] pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-md px-8 py-4 rounded-[2rem] border-4 border-green-500 shadow-2xl flex items-center gap-4">
                    <div className="bg-green-100 p-2.5 rounded-2xl text-green-600"><Sparkles size={28} /></div>
                    <div className={isRTL ? 'text-right' : 'text-left'}><h5 className="text-xl font-black text-slate-800 leading-none mb-1">{lang === 'en' ? 'Scan successful!' : 'הסריקה הצליחה!'}</h5></div>
                  </div>
                </div>
              )}
            </div>

            {qrSuccess && step.interactiveType === 'SIMULATED_QR' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
                <button onClick={() => setQrActiveAction('MENU')} className="bg-white p-8 rounded-[2rem] border-4 border-blue-100 hover:border-blue-500 transition-all flex flex-col items-center text-center group shadow-lg">
                  <div className="bg-blue-100 p-6 rounded-3xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"><FileText size={40} /></div>
                  <h5 className="text-2xl font-black text-slate-800">{lang === 'he' ? 'צפייה בתפריט' : 'View Menu'}</h5>
                </button>
                <button onClick={() => setQrActiveAction('REVIEWS')} className="bg-white p-8 rounded-[2rem] border-4 border-amber-100 hover:border-amber-500 transition-all flex flex-col items-center text-center group shadow-lg">
                  <div className="bg-amber-100 p-6 rounded-3xl text-amber-600 mb-4 group-hover:scale-110 transition-transform"><MessageSquare size={40} /></div>
                  <h5 className="text-2xl font-black text-slate-800">{lang === 'he' ? 'קריאת ביקורות' : 'Read Reviews'}</h5>
                </button>
                <button onClick={() => setQrActiveAction('WAITLIST')} className="bg-white p-8 rounded-[2rem] border-4 border-emerald-100 hover:border-emerald-500 transition-all flex flex-col items-center text-center group shadow-lg">
                  <div className="bg-emerald-100 p-6 rounded-3xl text-emerald-600 mb-4 group-hover:scale-110 transition-transform"><UserPlus size={40} /></div>
                  <h5 className="text-2xl font-black text-slate-800">{lang === 'he' ? 'הצטרפות לתור' : 'Join Waitlist'}</h5>
                </button>
              </div>
            )}

            {qrActiveAction && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up border-4 border-white">
                  <div className="p-6 border-b-2 border-slate-50 flex items-center justify-between bg-slate-50">
                    <h3 className="text-2xl font-black text-slate-800 px-4">
                      {qrActiveAction === 'MENU' && (lang === 'he' ? 'תפריט דיגיטלי' : 'Digital Menu')}
                      {qrActiveAction === 'REVIEWS' && (lang === 'he' ? 'מה לקוחות אומרים' : 'What Guests Say')}
                      {qrActiveAction === 'WAITLIST' && (lang === 'he' ? 'שמירת מקום בתור' : 'Join the Waitlist')}
                    </h3>
                    <button onClick={() => setQrActiveAction(null)} className="p-3 bg-white rounded-full text-slate-500 shadow-sm border-2 border-slate-200 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={28} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-h-[75vh] bg-slate-50/30">
                    {qrActiveAction === 'MENU' && <div className="space-y-6">{renderDigitalMenu()}</div>}
                    {qrActiveAction === 'REVIEWS' && (
                      <div className="space-y-8">
                        {[
                          { name: 'Sarah M.', rating: 5, comment: lang === 'en' ? 'The best pizza I have ever had! The service was lovely.' : 'הפיצה הכי טובה שאכלתי! השירות היה פשוט מקסים.' },
                          { name: 'David R.', rating: 4, comment: lang === 'en' ? 'Great atmosphere, but a bit loud on weekends.' : 'אווירה נהדרת, אבל קצת רועש בסופי שבוע.' },
                          { name: 'Rivka Cohen', rating: 5, comment: lang === 'en' ? 'Very accessible and easy to order from the QR code!' : 'מאוד נגיש וקל להזמין דרך קוד ה-QR!' }
                        ].map((rev, i) => (
                          <div key={i} className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
                             <div className="flex justify-between items-center mb-4"><span className="text-xl font-black text-slate-800">{rev.name}</span><div className="flex text-amber-500">{Array.from({ length: rev.rating }).map((_, j) => <Star key={j} size={18} fill="currentColor" />)}</div></div>
                             <p className="text-xl text-slate-700 leading-relaxed font-medium">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {qrActiveAction === 'WAITLIST' && (
                      <div className="text-center py-10 space-y-10 bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-sm">
                        <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><UserPlus size={64} /></div>
                        <div>
                          <h4 className="text-4xl font-black text-slate-800 mb-2">{lang === 'en' ? 'Current Wait: 15 mins' : 'זמן המתנה: 15 דקות'}</h4>
                          <p className="text-xl text-slate-500 font-bold uppercase tracking-widest">{lang === 'en' ? '2 parties ahead of you' : 'ישנן 2 קבוצות לפניכם'}</p>
                        </div>
                        <div className="space-y-4">
                          <Button fullWidth onClick={() => setQrActiveAction(null)} className="!bg-emerald-600 !py-6 !text-2xl !rounded-3xl shadow-xl shadow-emerald-100">{lang === 'en' ? 'Join the List' : 'הצטרפות לתור'}</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <style>{`
              @keyframes tagPop { from { transform: translate(-50%, 20px) scale(0.5); opacity: 0; } to { transform: translate(-50%, 0) scale(1); opacity: 1; } }
              @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
              @keyframes slideUp { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
              @keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
              @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
          </div>
        );

      case 'SIMULATED_MAP':
        return (
          <div className="mt-10 bg-white rounded-[2.5rem] border-4 border-slate-200 shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="bg-white p-6 border-b-2 border-slate-100 shadow-sm relative z-20">
               <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 border-2 border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all shadow-inner">
                    <Search size={24} className="text-slate-800" />
                    <input type="text" value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleMapSearch()} placeholder={lang === 'en' ? 'Search Google Maps...' : 'חפשו במפות גוגל...'} className="w-full bg-transparent py-5 px-3 text-2xl font-black outline-none placeholder:text-slate-800 text-slate-950" style={{ textAlign: isRTL ? 'right' : 'left' }} />
                  </div>
                  <Button onClick={handleMapSearch} className="!p-5 !rounded-2xl !bg-blue-600 shadow-lg shadow-blue-100"><Navigation size={28} className={isRTL ? 'rotate-180' : ''} /></Button>
               </div>
               {!mapHasResult && (
                 <p className="mt-4 px-4 py-3 bg-blue-50/70 rounded-xl text-slate-950 font-black text-xl flex items-center gap-3 animate-fade-in border-2 border-blue-400/30">
                    <Info size={28} className="text-blue-700 flex-shrink-0" /> 
                    {lang === 'en' ? `Try searching for '${step.interactiveData.targetSearch}'` : `נסו לחפש את המילה '${step.interactiveData.targetSearch}'`}
                 </p>
               )}
            </div>
            <div className="flex-1 bg-slate-50 relative min-h-[400px]">
              {mapIframeUrl ? (
                <iframe title="Google Maps" width="100%" height="100%" frameBorder="0" style={{ border: 0, minHeight: '400px' }} src={mapIframeUrl} allowFullScreen className="animate-fade-in"></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className="bg-slate-200 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-slate-800 shadow-inner"><Globe size={48} /></div>
                  <p className="text-2xl font-black text-slate-800 max-w-sm">{lang === 'en' ? 'Use the search bar above to see the interactive map.' : 'השתמשו בשורת החיפוש למעלה כדי לראות את המפה האינטראקטיבית.'}</p>
                </div>
              )}
              {mapHasResult && <div className="absolute bottom-6 right-6 z-30 animate-bounce"><div className="bg-green-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-black text-xl"><Sparkles /> {lang === 'en' ? 'Found it!' : 'מצאתם!'}</div></div>}
            </div>
          </div>
        );

      case 'SIMULATED_EMAIL':
        return (
          <div className="mt-10 bg-white rounded-[2rem] border-4 border-slate-200 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 p-4 text-white text-base font-black flex items-center justify-between">
              <div className="flex gap-1.5"><div className="w-4 h-4 rounded-full bg-red-400" /><div className="w-4 h-4 rounded-full bg-yellow-400" /><div className="w-4 h-4 rounded-full bg-green-400" /></div>
              <span className="opacity-80 uppercase tracking-widest text-sm">{lang === 'en' ? 'New Message' : 'הودعة حدشة'}</span>
              <div className="w-16" />
            </div>
            {emailSent ? (
              <div className="p-16 text-center bg-white animate-fade-in">
                <div className="bg-green-100 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner"><Send size={56} /></div>
                <h4 className="text-4xl font-black text-slate-800">{lang === 'en' ? 'Email Sent!' : 'המייל נשלח!'}</h4>
                <p className="text-2xl text-slate-600 mt-4 leading-relaxed">{lang === 'en' ? 'Great job. Your grandson will love it!' : 'עבודה מצוינת. הנכד ישמח לקבל את המכתב!'}</p>
              </div>
            ) : (
              <div className="p-8 bg-white space-y-2">
                <div className={`flex items-center border-b-2 border-slate-100 py-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <span className={`w-24 text-slate-400 font-black text-xl`}>{lang === 'en' ? 'To:' : 'אל:'}</span>
                  <input className="flex-1 outline-none font-bold text-2xl bg-white text-slate-950 placeholder:text-slate-300" placeholder="example@mail.com" value={emailTo} onChange={e => setEmailTo(e.target.value)} dir="ltr" />
                </div>
                <div className={`flex items-center border-b-2 border-slate-100 py-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <span className={`w-24 text-slate-400 font-black text-xl`}>{lang === 'en' ? 'Subject:' : 'נושא:'}</span>
                  <input className="flex-1 outline-none font-bold text-2xl bg-white text-slate-950 placeholder:text-slate-300" placeholder={lang === 'en' ? 'Enter subject' : 'הזינו נושא'} value={emailSub} onChange={e => setEmailSub(e.target.value)} />
                </div>
                <textarea className="w-full h-56 mt-4 outline-none resize-none text-2xl p-6 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-blue-200 text-slate-950 placeholder:text-slate-300" placeholder={lang === 'en' ? 'Type your message here...' : 'כתבו את ההודעה כאן...'} value={emailBody} onChange={e => setEmailBody(e.target.value)} style={{ textAlign: isRTL ? 'right' : 'left' }} />
                <Button onClick={() => setEmailSent(true)} disabled={!emailTo || !emailSub || !emailBody} className="mt-4 !py-5 !rounded-2xl !text-2xl w-full !bg-blue-600 shadow-lg"><Send size={28} /> {lang === 'en' ? 'Send Letter' : 'שליחת מכתב'}</Button>
              </div>
            )}
          </div>
        );

      case 'SIMULATED_SEARCH':
        return (
          <div className="mt-10 bg-white rounded-[2rem] border-4 border-slate-200 overflow-hidden shadow-2xl">
            <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex items-center gap-3">
               <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
               <div className="bg-white px-4 py-1 rounded-full border border-slate-300 text-slate-400 text-xs flex-1 truncate max-w-xs" dir="ltr">https://www.google.com</div>
            </div>
            <div className="p-12 text-center">
              <h1 className="text-5xl font-black tracking-tight mb-8"><span className="text-blue-600">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-600">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></h1>
              {searchSuccess ? (
                <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-200 animate-fade-in"><p className="text-green-700 text-xl font-black">{lang === 'en' ? "Perfect! That would find exactly what you need." : "מעולה! זה ימצא בדיוק מה שחיפשתם."}</p></div>
              ) : (
                <div className="max-w-md mx-auto relative group">
                  <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkSearch()} placeholder={step.interactiveData.placeholder} className="w-full pl-12 pr-6 py-5 rounded-full border-2 border-slate-200 text-2xl text-slate-950 placeholder:text-slate-300 shadow-inner" style={{ textAlign: isRTL ? 'right' : 'left' }} />
                  <Search size={28} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
                  <Button onClick={checkSearch} className="mt-6 !rounded-full">{lang === 'en' ? 'Search' : 'חיפוש'}</Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'SIMULATED_VOICE':
        return (
          <div className="mt-10 bg-white rounded-[2rem] border-4 border-slate-100 p-12 text-center shadow-inner">
            <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center transition-all ${voiceHeard ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}><Mic size={64} /></div>
            {voiceSuccess ? (
              <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200 animate-bounce"><p className="text-green-800 text-2xl font-black">{lang === 'en' ? 'Command recognized!' : 'הפקודה זוהתה!'}</p></div>
            ) : (
              <Button onClick={() => { setVoiceHeard(true); setTimeout(() => setVoiceSuccess(true), 2000); }} disabled={voiceHeard} className="!rounded-full !py-6 !px-12 !text-2xl">{voiceHeard ? (lang === 'en' ? 'Listening...' : 'מקשיב...') : (lang === 'en' ? 'Press and Speak' : 'לחצו ודברו')}</Button>
            )}
          </div>
        );

      case 'SECURE_CHECKOUT':
        return (
          <div className="mt-10 bg-white rounded-[2rem] border-4 border-slate-200 shadow-2xl overflow-hidden p-10 space-y-6">
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border mb-4" dir="ltr"><Lock size={20} className="text-green-600" /><div className="text-slate-500 text-sm font-bold truncate">https://secure.pharmacy.com/pay</div></div>
            <h3 className="text-2xl font-black text-slate-800">{lang === 'en' ? 'Complete Secure Purchase' : 'השלם רכישה מאובטחת'}</h3>
            {checkoutStatus === 'SUCCESS' ? (
              <div className="bg-green-100 p-6 rounded-2xl border-2 border-green-200 text-green-900 font-black text-xl flex items-center gap-3 animate-fade-in"><Sparkles /> {lang === 'en' ? 'Order Placed!' : 'ההזמנה בוצעה!'}</div>
            ) : (
              <Button onClick={() => { setCheckoutStatus('CHECKING'); setTimeout(() => setCheckoutStatus('SUCCESS'), 1500); }} isLoading={checkoutStatus === 'CHECKING'} className="!w-full !py-6 !text-2xl !bg-green-600"><Lock size={24} /> {lang === 'en' ? 'Pay Now' : 'שלם עכשיו'}</Button>
            )}
          </div>
        );

      case 'SIMULATED_VIDEO_CALL':
        return (
          <div className="mt-10 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative aspect-video flex flex-col items-center justify-center p-8">
            {callSuccess ? (
              <div className="text-center animate-fade-in space-y-4"><div className="w-32 h-32 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 animate-pulse"><Video size={64} /></div><h4 className="text-white text-4xl font-black">{lang === 'en' ? 'Connected!' : 'מחובר!'}</h4></div>
            ) : (
              <div className="text-center space-y-8">
                <div className="flex gap-6 justify-center">
                  <button onClick={() => setMicOn(!micOn)} className={`w-20 h-20 rounded-full flex items-center justify-center ${micOn ? 'bg-blue-600' : 'bg-red-500 animate-pulse'}`}>{micOn ? <Mic size={32} /> : <MicOff size={32} />}</button>
                  <button onClick={() => setVideoOn(!videoOn)} className={`w-20 h-20 rounded-full flex items-center justify-center ${videoOn ? 'bg-blue-600' : 'bg-red-500 animate-pulse'}`}>{videoOn ? <Video size={32} /> : <VideoOff size={32} />}</button>
                </div>
                <p className="text-slate-400 font-bold">{lang === 'en' ? 'Press buttons to turn them blue' : 'לחצו על הכפתורים להפוך אותם לכחולים'}</p>
              </div>
            )}
          </div>
        );

      case 'QUIZ':
        return (
          <div className="mt-10 space-y-5">
            <h4 className="text-2xl font-black text-slate-800 mb-6">{step.interactiveData.question}</h4>
            {step.interactiveData.options.map((opt: string, i: number) => (
              <button 
                key={i} 
                onClick={() => checkQuiz(i)} 
                className={`w-full p-6 rounded-3xl border-4 text-left text-2xl font-black transition-all shadow-sm ${
                  quizAnswer === i 
                    ? (quizCorrect ? 'border-green-500 bg-green-50 text-green-900' : 'border-red-400 bg-red-50 text-red-900') 
                    : 'border-slate-100 bg-slate-50 text-slate-800 hover:border-slate-300'
                }`} 
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const renderContentWithLTR = (text: string) => {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    const parts = text.split(emailRegex);
    return parts.map((part, i) => {
      if (part.match(emailRegex)) return <span key={i} dir="ltr" className="inline-block font-bold text-blue-600 mx-1">{part}</span>;
      return part;
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between px-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-black text-xl hover:text-blue-600">
          {isRTL ? <ChevronRight size={28} /> : <ChevronLeft size={28} />} {t.backToHub}
        </button>
        <span className="text-slate-400 font-black uppercase tracking-widest text-lg">{t.step} {stepIndex + 1} {t.of} {lesson.steps.length}</span>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border-4 border-slate-50 relative">
        <div className="absolute top-[-30px] right-[-30px] hidden lg:block"><BirdAssistant state={isDragging ? 'thinking' : (lensSuccess ? 'happy' : 'talking')} /></div>
        <ProgressBar current={stepIndex + 1} total={lesson.steps.length} />
        <div className="mt-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-8 leading-tight">{step.title}</h2>
          <div className="prose-xl text-slate-700 leading-relaxed mb-12 text-2xl font-medium">{renderContentWithLTR(step.content)}</div>
          {renderInteractive()}
        </div>
        
        {genError && (step.interactiveType === 'SIMULATED_QR' || step.interactiveType === 'SIMULATED_LENS') && (
          <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3 text-amber-700 font-bold"><AlertCircle size={20} />{genError}</div>
        )}

        <div className="mt-16 flex justify-between items-center pt-10 border-t-2 border-slate-50">
          <Button variant="secondary" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>
            {isRTL ? <ChevronRight size={24} /> : <ChevronLeft size={24} />} {t.prev}
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={
              (step.interactiveType === 'QUIZ' && !quizCorrect) || 
              (step.interactiveType === 'SIMULATED_SEARCH' && !searchSuccess) || 
              (step.interactiveType === 'SIMULATED_VIDEO_CALL' && !callSuccess) || 
              (step.interactiveType === 'SIMULATED_QR' && (!qrSuccess || isGeneratingImg)) || 
              (step.interactiveType === 'SIMULATED_LENS' && (!lensSuccess || isGeneratingImg)) || 
              (step.interactiveType === 'SIMULATED_VOICE' && !voiceSuccess) || 
              (step.interactiveType === 'SECURE_CHECKOUT' && checkoutStatus !== 'SUCCESS') || 
              (step.interactiveType === 'SIMULATED_EMAIL' && !emailSent) ||
              (step.interactiveType === 'SIMULATED_MAP' && !mapHasResult)
            } 
            className={`!px-6 sm:!px-10 !py-4 sm:!py-5 !rounded-2xl !text-xl sm:!text-2xl transition-all duration-500 ${(qrSuccess || lensSuccess) ? 'animate-bounce !bg-green-600' : ''}`}
          >
            {isLastStep ? t.finish : t.next} {isRTL ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
