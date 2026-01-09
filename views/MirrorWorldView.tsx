
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/Button';
import { LoadingBar } from '../components/LoadingBar';
import { Markdown } from '../components/Markdown';
import { Language, MirrorTask, MirrorTaskStep } from '../types';
import { UI_STRINGS } from '../i18n/translations';
import { generateMirrorTask, generateSpeech, decode, decodeAudioData, generateFinalResult } from '../services/geminiService';
import { 
  Layout, Sparkles, ArrowLeft, CheckCircle2, RefreshCw, Compass, Volume2, 
  StopCircle, Check, Lightbulb, FileCheck, Clipboard, ShoppingCart, Apple, 
  Utensils, Package, Plus, Trash2, Loader2, Clock, Phone, Truck, Mail, 
  Building2, Calendar, Users, MapPin, AlertCircle 
} from 'lucide-react';

interface MirrorWorldViewProps {
  lang: Language;
  onBack: () => void;
  isDecisionDashboard?: boolean;
  initialGoal?: string;
}

interface FinalResultStep {
  text: string;
  icon: string;
}

interface FinalResultData {
  confirmationTitle: string;
  summary: string;
  confirmationCode: string;
  nextSteps: FinalResultStep[];
}

const GROCERY_EMOJI_MAP: Record<string, string> = {
  'milk': '🥛', 'חלב': '🥛',
  'bread': '🍞', 'לחם': '🍞', 'לחמניה': '🥯', 'לחמניות': '🥯',
  'egg': '🥚', 'eggs': '🥚', 'ביצים': '🥚', 'ביצה': '🥚',
  'fruit': '🍎', 'fruits': '🍎', 'פירות': '🍎', 'פרי': '🍎',
  'vegetables': '🥦', 'veggies': '🥦', 'ירקות': '🥦', 'ירק': '🥦',
  'cheese': '🧀', 'גבינה': '🧀', 'גבינות': '🧀',
  'water': '💧', 'מים': '💧',
  'meat': '🥩', 'steak': '🥩', 'בשר': '🥩',
  'chicken': '🍗', 'עוף': '🍗',
  'rice': '🍚', 'אורז': '🍚',
  'pasta': '🍝', 'פסטה': '🍝',
  'sugar': '🧂', 'סוכר': '🧂',
  'coffee': '☕', 'קפה': '☕',
  'tea': '🍵', 'תה': '🍵',
  'butter': '🧈', 'חמאה': '🧈',
  'yogurt': '🍦', 'יוגורט': '🍦',
  'apple': '🍎', 'תפוח': '🍎',
  'banana': '🍌', 'בננה': '🍌',
  'tomato': '🍅', 'עגבניה': '🍅',
  'cucumber': '🥒', 'מלפפון': '🥒',
  'onion': '🧅', 'בצל': '🧅',
  'garlic': '🧄', 'שום': '🧄',
  'potato': '🥔', 'תפוח אדמה': '🥔',
  'oil': '🛢️', 'שמן': '🛢️',
  'flour': '🌾', 'קמח': '🌾',
  'juice': '🧃', 'מיץ': '🧃',
  'cookies': '🍪', 'עוגיות': '🍪',
  'cereal': '🥣', 'דגנים': '🥣',
  'honey': '🍯', 'דבש': '🍯',
  'pizza': '🍕', 'פיצה': '🍕',
  'fish': '🐟', 'דג': '🐟'
};

const COMMON_GROCERIES_HE = [
  { name: 'לחם', emoji: '🍞' },
  { name: 'חלב', emoji: '🥛' },
  { name: 'ביצים', emoji: '🥚' },
  { name: 'גבינה', emoji: '🧀' },
  { name: 'פירות', emoji: '🍎' },
  { name: 'ירקות', emoji: '🥦' },
  { name: 'בשר', emoji: '🥩' },
  { name: 'קפה', emoji: '☕' },
  { name: 'מים', emoji: '💧' },
  { name: 'עוף', emoji: '🍗' },
];

const COMMON_GROCERIES_EN = [
  { name: 'Bread', emoji: '🍞' },
  { name: 'Milk', emoji: '🥛' },
  { name: 'Eggs', emoji: '🥚' },
  { name: 'Cheese', emoji: '🧀' },
  { name: 'Fruit', emoji: '🍎' },
  { name: 'Veggies', emoji: '🥦' },
  { name: 'Meat', emoji: '🥩' },
  { name: 'Coffee', emoji: '☕' },
  { name: 'Water', emoji: '💧' },
  { name: 'Chicken', emoji: '🍗' },
];

export const MirrorWorldView: React.FC<MirrorWorldViewProps> = ({ lang, onBack, isDecisionDashboard = false, initialGoal }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';

  const [userGoal, setUserGoal] = useState(initialGoal || '');
  const [currentTask, setCurrentTask] = useState<MirrorTask | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [finalResult, setFinalResult] = useState<FinalResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [inputValue, setInputValue] = useState(''); 
  const [selectValue, setSelectValue] = useState(''); 
  const [isNarrating, setIsNarrating] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const speechRequestIdRef = useRef(0);

  const examples = [
    t.example1,
    t.example2,
    t.example3,
    t.example4,
    t.example5
  ];

  const isGroceryTask = userGoal.toLowerCase().includes('grocery') || userGoal.includes('מצרכים') || userGoal.includes('סופר');

  useEffect(() => {
    if (initialGoal) {
        handleGenerateTask();
    }
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    speechRequestIdRef.current++; 
    if (currentAudioSourceRef.current) {
      try { currentAudioSourceRef.current.stop(); } catch (e) {}
      currentAudioSourceRef.current.disconnect();
      currentAudioSourceRef.current = null;
    }
    setIsNarrating(false);
    setIsSpeechLoading(false);
  };

  const speakGuidance = async (text: string) => {
    if (!text) return;
    stopAudio();
    const requestId = speechRequestIdRef.current;
    setIsSpeechLoading(true);
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const base64 = await generateSpeech(text, 'Zephyr', { lang });
      
      if (requestId !== speechRequestIdRef.current) return;

      const buffer = await decodeAudioData(decode(base64), audioContextRef.current, 24000, 1);
      
      if (requestId !== speechRequestIdRef.current) return;

      setIsSpeechLoading(false);
      setIsNarrating(true);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        if (requestId === speechRequestIdRef.current) {
          setIsNarrating(false);
        }
      };
      source.start(0);
      currentAudioSourceRef.current = source;
    } catch (e) {
      if (requestId === speechRequestIdRef.current) {
        setIsNarrating(false);
        setIsSpeechLoading(false);
      }
    }
  };

  const handleGenerateTask = async (goalOverride?: string) => {
    const goalToProcess = (goalOverride || userGoal).trim();
    if (!goalToProcess) return;

    if (goalOverride) {
      setUserGoal(goalOverride);
    }

    setIsLoading(true);
    setError(null);
    setCurrentTask(null);
    setCurrentStepIndex(0);
    setFinalResult(null);
    setInputValue('');
    setSelectValue('');

    try {
      const task = await generateMirrorTask(goalToProcess, lang, {
        lang: lang,
        onProgress: (p, m) => {
          setLoadingProgress(p);
          setLoadingMessage(m);
        },
        onError: (err) => {
          setError(err.message || t.mirrorWorldError);
          setIsLoading(false);
        }
      });
      setCurrentTask(task);
      setLoadingMessage(t.complete);
      
      if (task.steps[0].doriGuidance) {
        setTimeout(() => {
          if (task === currentTask) speakGuidance(task.steps[0].doriGuidance!);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || t.mirrorWorldError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentTask && currentStepIndex < currentTask.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      
      setCurrentStepIndex(nextIndex);
      setInputValue('');
      setSelectValue('');
      
      if (currentTask.steps[nextIndex].doriGuidance) {
        speakGuidance(currentTask.steps[nextIndex].doriGuidance!);
      }
    } else if (currentTask && currentStepIndex === currentTask.steps.length - 1) {
      setIsLoading(true);
      setError(null);
      setLoadingMessage(t.generatingResult);
      
      try {
        const result = await generateFinalResult(userGoal, lang, {
          lang: lang,
          onProgress: (p, m) => {
            setLoadingProgress(p);
            setLoadingMessage(m);
          }
        });
        setFinalResult(result);
        setCurrentStepIndex(prev => prev + 1); 

        const narrationText = `${result.confirmationTitle}. ${result.summary}. ${t.nextRealSteps} ${result.nextSteps.map(s => s.text).join(', ')}`;
        speakGuidance(narrationText);
      } catch (err: any) {
        console.error("Result generation error:", err);
        setCurrentStepIndex(prev => prev + 1);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentStep: MirrorTaskStep | null = currentTask && currentTask.steps[currentStepIndex] ? currentTask.steps[currentStepIndex] : null;
  const isTaskComplete = currentTask && currentStepIndex >= currentTask.steps.length;

  const resetMirrorWorld = () => {
    stopAudio();
    setUserGoal('');
    setCurrentTask(null);
    setCurrentStepIndex(0);
    setFinalResult(null);
    setIsLoading(false);
    setError(null);
    setLoadingProgress(0);
    setLoadingMessage('');
    setInputValue('');
    setSelectValue('');
  };

  const getDetectedEmojis = (text: string) => {
    const words = text.split(/[,\s]+/).map(w => w.toLowerCase());
    const detected: string[] = [];
    words.forEach(word => {
      if (GROCERY_EMOJI_MAP[word]) {
        detected.push(GROCERY_EMOJI_MAP[word]);
      } else {
        for (const key in GROCERY_EMOJI_MAP) {
          if (word.includes(key) || key.includes(word)) {
            detected.push(GROCERY_EMOJI_MAP[key]);
            break;
          }
        }
      }
    });
    return Array.from(new Set(detected));
  };

  const detectedEmojis = isGroceryTask ? getDetectedEmojis(inputValue) : [];

  const handleShelfTap = (item: { name: string, emoji: string }) => {
    setInputValue(prev => {
        const current = prev.trim();
        if (!current) return item.name;
        if (current.includes(item.name)) return prev;
        return `${current}, ${item.name}`;
    });
  };

  const groceryShelfItems = lang === 'he' ? COMMON_GROCERIES_HE : COMMON_GROCERIES_EN;

  const renderResultIcon = (keyword: string) => {
    const size = 32;
    switch (keyword.toLowerCase()) {
      case 'clock': return <Clock size={size} className="text-blue-500" />;
      case 'phone': return <Phone size={size} className="text-emerald-500" />;
      case 'truck': return <Truck size={size} className="text-orange-500" />;
      case 'mail': return <Mail size={size} className="text-indigo-500" />;
      case 'bank': return <Building2 size={size} className="text-slate-600" />;
      case 'calendar': return <Calendar size={size} className="text-red-500" />;
      case 'users': return <Users size={size} className="text-purple-500" />;
      case 'map': return <MapPin size={size} className="text-rose-500" />;
      case 'alert': return <AlertCircle size={size} className="text-amber-500" />;
      default: return <CheckCircle2 size={size} className="text-green-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 pt-4 md:pt-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> {t.back}
        </button>
      </div>

      <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
          <div className={`${isDecisionDashboard ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'} p-6 rounded-[2rem] shadow-inner`}>
            {isDecisionDashboard ? <Compass size={56} /> : <Layout size={56} />}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
              {isDecisionDashboard ? t.decisionNavigator : t.mirrorWorld}
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl">
              {isDecisionDashboard ? t.decisionDashboardDesc : t.mirrorWorldDesc}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10">
            <LoadingBar message={loadingMessage} progress={loadingProgress} lang={lang} estimatedDuration={15000} />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-8 rounded-[2.5rem] border-2 border-red-100 text-xl flex flex-col items-center gap-6 text-center">
            <div className="bg-red-200 p-4 rounded-full"><Sparkles className="flex-shrink-0" size={32} /></div>
            <p className="font-black text-2xl">{error}</p>
            <Button onClick={resetMirrorWorld} variant="secondary">{t.startOverNewPhoto}</Button>
          </div>
        ) : isTaskComplete ? (
          <div className="text-center py-6 md:py-12 space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-green-50 mb-4 animate-bounce">
              <CheckCircle2 size={72} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-4xl md:text-6xl font-black text-slate-800">{t.mirrorWorldComplete}</h3>
              <p className="text-xl md:text-2xl text-slate-600 font-bold max-w-2xl mx-auto leading-relaxed">
                {t.mirrorWorldGreatJob}
              </p>
            </div>

            {finalResult && (
              <div className="mt-12 bg-white rounded-[3rem] border-4 border-slate-100 shadow-2xl overflow-hidden text-left" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="bg-slate-50 p-8 border-b-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                     <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl">
                        <FileCheck size={40} />
                     </div>
                     <div>
                       <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{t.officialConfirmation}</h4>
                       <p className="text-blue-600 font-black tracking-widest text-lg">{finalResult.confirmationCode}</p>
                     </div>
                   </div>
                   <div className="bg-green-100 text-green-700 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                     {t.complete}
                   </div>
                </div>
                
                <div className="p-8 md:p-14 space-y-12">
                   <div className="space-y-6 text-center md:text-left">
                     <h5 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">{finalResult.confirmationTitle}</h5>
                     <div className="bg-blue-50 p-8 rounded-[2rem] border-2 border-blue-100 shadow-inner">
                        <p className="text-2xl font-bold text-slate-700 leading-relaxed italic">
                          "{finalResult.summary}"
                        </p>
                     </div>
                   </div>

                   <div className="space-y-8">
                     <h6 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                       <Compass size={32} className="text-orange-500" />
                       {t.nextRealSteps}
                     </h6>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {finalResult.nextSteps.map((step, i) => (
                         <div key={i} className="flex items-start gap-6 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-blue-300 hover:bg-white transition-all group">
                           <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                             {renderResultIcon(step.icon)}
                           </div>
                           <p className="text-xl font-bold text-slate-700 leading-relaxed mt-1">{step.text}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-8 text-center text-slate-400 text-sm font-black uppercase tracking-widest border-t-2 border-slate-100 flex items-center justify-center gap-4">
                   <Sparkles size={16} />
                   Generated for educational practice by Dori AI
                   <Sparkles size={16} />
                </div>
              </div>
            )}

            <div className="pt-10 flex flex-col sm:flex-row gap-6 justify-center">
              <Button onClick={resetMirrorWorld} className="!py-8 !px-16 !rounded-[2.5rem] !text-3xl shadow-2xl shadow-blue-200 hover:-translate-y-1 transition-transform">
                <RefreshCw size={36} className="mr-3" /> {t.startNewPractice}
              </Button>
              <Button onClick={onBack} variant="secondary" className="!py-8 !px-16 !rounded-[2.5rem] !text-3xl hover:-translate-y-1 transition-transform">
                {t.home}
              </Button>
            </div>
          </div>
        ) : currentTask ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
            <div className="lg:col-span-4 space-y-4">
               <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
                  <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-200 pb-4">{t.simulatedEnvironment}</h5>
                  <div className="space-y-8">
                    {currentTask.steps.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-6 group">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-black border-4 transition-all ${
                          idx < currentStepIndex ? 'bg-green-500 border-green-600 text-white' :
                          idx === currentStepIndex ? 'bg-blue-600 border-blue-700 text-white shadow-xl scale-110' :
                          'bg-white border-slate-200 text-slate-300'
                        }`}>
                          {idx < currentStepIndex ? <Check size={28} /> : idx + 1}
                        </div>
                        <span className={`text-xl md:text-2xl font-black transition-all ${idx === currentStepIndex ? 'text-slate-900' : 'text-slate-400'}`}>
                          {s.title}
                        </span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-10">
              {currentStep?.doriGuidance && (
                <div className="relative group">
                  <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-lg border-2 animate-bounce-subtle ${isRTL ? 'rounded-tr-none' : 'rounded-tl-none'} ${
                    isDecisionDashboard ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-indigo-50 border-indigo-100 text-indigo-900'
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="font-black text-sm md:text-base uppercase tracking-widest flex items-center gap-3 opacity-70">
                        <Sparkles size={20} className="text-blue-500" /> {t.doriAdvice}
                      </h4>
                      <button 
                        onClick={() => {
                          if (isNarrating || isSpeechLoading) stopAudio();
                          else speakGuidance(currentStep.doriGuidance!);
                        }}
                        className={`p-4 rounded-full transition-all ${isNarrating || isSpeechLoading ? 'bg-blue-600 text-white scale-125 shadow-lg' : 'bg-blue-100 text-blue-600 hover:scale-110'}`}
                      >
                        {isSpeechLoading ? (
                          <Loader2 size={32} className="animate-spin" />
                        ) : isNarrating ? (
                          <StopCircle size={32} className="animate-pulse" />
                        ) : (
                          <Volume2 size={32} />
                        )}
                      </button>
                    </div>
                    <p className="text-2xl md:text-4xl font-black leading-snug">
                      {currentStep.doriGuidance}
                    </p>
                  </div>
                  <div className={`absolute top-0 w-12 h-12 ${isDecisionDashboard ? 'bg-blue-50' : 'bg-indigo-50'} -z-10 transform ${isRTL ? 'right-0 -translate-y-1/2' : 'left-0 -translate-y-1/2'}`} style={{ clipPath: 'polygon(0% 100%, 100% 100%, 50% 0%)' }} />
                </div>
              )}

              <div className={`bg-white p-8 md:p-12 rounded-[3.5rem] md:rounded-[5rem] border-4 border-slate-50 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] space-y-8 ${isGroceryTask ? 'ring-8 ring-blue-50/50' : ''}`}>
                <div className="space-y-4">
                  <h4 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight flex items-center gap-4">
                    {isGroceryTask && <ShoppingCart className="text-blue-500" size={48} />}
                    {currentStep?.title}
                  </h4>
                  <div className="text-xl md:text-2xl text-slate-500 font-bold leading-relaxed">
                    <Markdown content={currentStep?.content || ''} />
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-slate-50">
                  {currentStep?.button.type === 'CLICK' && (
                    <Button onClick={handleNextStep} fullWidth className="!py-10 !text-3xl md:!text-4xl !rounded-[2.5rem] !bg-blue-600 hover:!bg-blue-700 shadow-2xl shadow-blue-100">
                      {currentStep.button.label}
                    </Button>
                  )}
                  {currentStep?.button.type === 'INPUT_TEXT' && (
                    <div className="space-y-6">
                      {isGroceryTask && (
                        <div className="bg-slate-50 rounded-[2.5rem] p-6 border-2 border-slate-100 shadow-inner flex flex-col gap-4 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2">
                             <div className="flex items-center gap-3 text-blue-600 font-black uppercase text-sm tracking-widest">
                               <Package size={24} /> {t.yourCart || 'Your Basket'}
                             </div>
                             <button onClick={() => setInputValue('')} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                               <Trash2 size={20} />
                             </button>
                          </div>
                          
                          {inputValue.trim() ? (
                            <div className="flex flex-wrap gap-4">
                              {detectedEmojis.length > 0 ? (
                                detectedEmojis.map((emoji, i) => (
                                  <div key={i} className="text-5xl bg-white p-3 rounded-3xl shadow-sm border border-slate-100 transform hover:scale-110 transition-transform animate-bounce-subtle" style={{ animationDelay: `${i * 0.15}s` }}>
                                    {emoji}
                                  </div>
                                ))
                              ) : (
                                <div className="text-lg font-black text-slate-400 p-4 bg-white rounded-3xl w-full text-center border-2 border-dashed border-slate-200">
                                   {t.itemsInList || 'Items in list...'}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-8 text-center flex flex-col items-center gap-2 text-slate-300 opacity-50">
                               <ShoppingCart size={64} />
                               <p className="font-black text-xl">{t.cartEmpty || 'Empty basket'}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {isGroceryTask && (
                        <div className="space-y-4">
                           <p className="text-slate-400 font-black uppercase text-xs tracking-widest px-4">{t.tapToAdd || 'Tap to add to basket:'}</p>
                           <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              {groceryShelfItems.map((item, i) => (
                                <button 
                                  key={i} 
                                  onClick={() => handleShelfTap(item)}
                                  className="bg-white hover:bg-blue-50 border-2 border-slate-100 hover:border-blue-200 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-90 shadow-sm group"
                                >
                                  <span className="text-3xl group-hover:scale-125 transition-transform">{item.emoji}</span>
                                  <span className="text-sm font-black text-slate-700">{item.name}</span>
                                  <Plus size={16} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ))}
                           </div>
                        </div>
                      )}

                      <div className="bg-slate-100 p-6 rounded-[3rem] shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)] border-2 border-slate-200 group-focus-within:border-blue-400 transition-all">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={currentStep.button.placeholder || '...'}
                          className={`w-full p-6 text-2xl md:text-3xl bg-white border-2 border-slate-50 rounded-[2.5rem] focus:outline-none text-slate-900 placeholder-slate-300 shadow-xl focus:ring-8 focus:ring-blue-100 transition-all`}
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>

                      <Button onClick={handleNextStep} fullWidth disabled={!inputValue.trim()} className="!py-10 !text-3xl md:!text-4xl !rounded-[3rem] !bg-blue-600 hover:!bg-blue-700 shadow-2xl shadow-blue-200 active:translate-y-1">
                        {currentStep.button.label}
                      </Button>
                    </div>
                  )}
                  {currentStep?.button.type === 'SELECT_OPTION' && (
                    <div className="space-y-6">
                      <div className="bg-slate-100 p-6 rounded-[3rem] shadow-inner border-2 border-slate-200">
                        <div className="grid grid-cols-1 gap-4">
                          {currentStep.button.options?.map((option, i) => {
                            const words = option.toLowerCase().split(/\s+/);
                            let foundEmoji = '';
                            for (const word of words) {
                              if (GROCERY_EMOJI_MAP[word]) {
                                foundEmoji = GROCERY_EMOJI_MAP[word];
                                break;
                              }
                            }
                            
                            if (!foundEmoji) {
                                const emojiMatch = option.match(/[\p{Emoji_Presentation}\p{Emoji}\p{Emoji_Modifier_Base}]/u);
                                if (emojiMatch) foundEmoji = emojiMatch[0];
                            }

                            return (
                              <button
                                key={i}
                                onClick={() => { setSelectValue(option); handleNextStep(); }}
                                className={`w-full p-8 text-2xl md:text-3xl rounded-[2.5rem] border-4 flex items-center gap-6 transition-all active:scale-95 shadow-lg ${
                                  selectValue === option 
                                    ? 'bg-blue-600 text-white border-blue-700' 
                                    : 'bg-white text-slate-800 border-white hover:border-blue-200'
                                }`}
                              >
                                {foundEmoji && <span className="text-4xl">{foundEmoji}</span>}
                                <span className="font-black text-left flex-1">{option}</span>
                                <Check className={`opacity-0 transition-opacity ${selectValue === option ? 'opacity-100' : ''}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-8">
                 <button onClick={resetMirrorWorld} className="text-slate-400 font-black uppercase text-sm tracking-widest hover:text-red-500 transition-colors flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full">
                    <RefreshCw size={20} /> {t.startNewPractice}
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 py-4 max-w-3xl mx-auto">
            <div className="space-y-4">
              <label className="text-2xl md:text-3xl font-black text-slate-700">{t.whatToPractice}</label>
              <textarea
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                placeholder={t.mirrorWorldPlaceholder}
                className="w-full p-10 text-2xl md:text-3xl border-4 border-slate-100 rounded-[3rem] min-h-[220px] outline-none focus:border-blue-500 transition-all bg-slate-50 text-slate-900 placeholder-slate-300 shadow-inner resize-none"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 text-slate-400 font-black uppercase text-xs tracking-widest px-2">
                 <Lightbulb size={16} className="text-yellow-500" /> {t.tryExamples}
               </div>
               <div className="flex flex-wrap gap-2">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleGenerateTask(ex)}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-50 text-blue-700 font-black rounded-full border border-slate-200 hover:border-blue-200 transition-all text-sm active:scale-95 shadow-sm"
                    >
                      {ex}
                    </button>
                  ))}
               </div>
            </div>

            <Button 
              onClick={() => handleGenerateTask()} 
              fullWidth 
              disabled={!userGoal.trim()}
              className="!py-10 !px-12 !rounded-[3rem] !bg-blue-600 hover:!bg-blue-700 shadow-2xl shadow-blue-100 group !text-3xl"
            >
              <Sparkles size={40} className="group-hover:rotate-12 transition-transform" /> {t.generateTask}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
