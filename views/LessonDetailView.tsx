
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Language, Message, ImageSize, TTSVoiceName, CachedImageMap } from '../types';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Markdown } from '../components/Markdown';
import { UI_STRINGS } from '../i18n/translations';
import { generateImage, generateTextResponse, generateSpeech, decode, decodeAudioData, editImage, analyzeImageContent, generateNanoBananaImage } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { 
  ChevronLeft, ChevronRight, Sparkles, Send, Search, Navigation, Info, Globe, 
  QrCode, FileText, MessageSquare, UserPlus, X, Star, UtensilsCrossed, Coffee, Plus, 
  ShoppingBag, Eye, ThumbsUp, MessageCircle, Heart, Camera, Lock, Mic, MicOff, Video, VideoOff,
  MoreVertical, ExternalLink, CreditCard, Bus, Users, Clock, CheckCircle2, XCircle, Paperclip, Image as ImageIcon, Trash2, Smile, Bot, Wand2, Download, RefreshCw, Volume2, StopCircle, Upload, Wallet,
  Share2, Train, 
  Map as MapIcon, 
  Ticket, Package, Book, MessageCircleMore, Check, MapPin, Pill, Truck, Home, Utensils, Headphones, Gift, Calendar, UserCheck, Phone, ShieldAlert, BookOpen, GraduationCap, Type, Cloud, CheckCircle, MousePointer2, Layout, CreditCard as CardIcon, AlertTriangle, AlertCircle
} from 'lucide-react';
import { LoadingBar } from '../components/LoadingBar';

interface LessonDetailViewProps {
  lesson: Lesson;
  onFinish: (id: string) => void;
  onBack: () => void;
  lang: Language;
  cachedBackgroundImages: CachedImageMap;
  onPreFetchNext: (prompt: string) => void;
}

const BirdAssistant: React.FC<{ state?: 'happy' | 'thinking' | 'talking' }> = ({ state = 'happy' }) => (
  <div className="relative w-12 h-12 sm:w-20 sm:h-20 bird-container">
    <style>{`
      .bird-container { animation: float 3s ease-in-out infinite; }
      @keyframes float { 0%, 100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-10px) rotate(-2deg); } }
      .bird-body { background: #f97316; border-radius: 50% 50% 40% 40%; position: relative; width: 100%; height: 100%; box-shadow: inset -4px -4px 0 rgba(0,0,0,0.1); border: 2px solid #7c2d12; }
      .bird-eye { background: #fff; border-radius: 50%; width: 22%; height: 22%; position: absolute; top: 25%; left: 20%; border: 1.5px solid #7c2d12; overflow: hidden; }
      .bird-pupil { background: #000; border-radius: 50%; width: 45%; height: 45%; position: absolute; top: 25%; left: 25%; }
      .bird-eye.right { left: 58%; }
      .bird-beak { background: #fbbf24; width: 26%; height: 18%; border-radius: 0 0 100% 100%; position: absolute; top: 48%; left: 50%; transform: translateX(-50%); border: 1.5px solid #7c2d12; }
      ${state === 'thinking' ? '.bird-eye { height: 3px; margin-top: 4px; } .bird-pupil { display: none; }' : ''}
      ${state === 'talking' ? '.bird-beak { animation: talk 0.3s infinite; } @keyframes talk { 0%, 100% { transform: translateX(-50%) scaleY(1); } 50% { transform: translateX(-50%) scaleY(1.4); } }' : ''}
    `}</style>
    <div className="bird-body">
      <div className="bird-eye"><div className="bird-pupil" /></div>
      <div className="bird-eye right"><div className="bird-pupil" /></div>
      <div className="bird-beak" />
    </div>
  </div>
);

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({ lesson, onFinish, onBack, lang, cachedBackgroundImages, onPreFetchNext }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  const [stepIndex, setStepIndex] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 75 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [interactiveState, setInteractiveState] = useState<any>({});
  
  // State for LIVE_AI_CHAT
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // State for SIMULATED_IMAGE_GENERATION
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [generatedImageOutput, setGeneratedImageOutput] = useState<string | null>(null);
  const [isImageGenLoading, setIsImageGenLoading] = useState(false);
  const [imageGenError, setImageGenError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const bureaucracyFileInputRef = useRef<HTMLInputElement>(null);
  const step = lesson.steps[stepIndex];
  const isLastStep = stepIndex === lesson.steps.length - 1;

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  useEffect(() => {
    // Initialize chat messages if interactiveType is LIVE_AI_CHAT
    if (step.interactiveType === 'LIVE_AI_CHAT' && chatMessages.length === 0) {
      setChatMessages([{ id: 'init', role: 'model', text: step.interactiveData?.initialPrompt || t.chatInitialMessage }]);
    }
    // Reset image generation state when changing steps
    if (step.interactiveType !== 'SIMULATED_IMAGE_GENERATION') {
      setImageGenPrompt('');
      setGeneratedImageOutput(null);
      setIsImageGenLoading(false);
      setImageGenError(null);
    }
    // Reset chat state when changing steps
    if (step.interactiveType !== 'LIVE_AI_CHAT') {
      setChatMessages([]);
      setChatInput('');
      setIsChatLoading(false);
    }
    // Reset other interactive states
    setInteractiveState({});
  }, [step, lang]);

  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleNext = () => { 
    if (isLastStep) onFinish(lesson.id); 
    else { 
      setStepIndex(prev => prev + 1); 
      setInteractiveState({});
    } 
  };

  const handleBureaucracyFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInteractiveState({ ...interactiveState, loading: true, loadingMessage: t.analyzingDoc });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const mimeType = file.type;

      try {
        const prompt = `Analyze this official document/letter. Explain what it is, its urgency (High/Medium/Low), and provide a simple 3-step checklist of what to do next. Use very simple language suitable for an elderly person. Avoid jargon. Use the ${lang === 'he' ? 'Hebrew' : 'English'} language for the response. Output as Markdown.`;
        
        const result = await analyzeImageContent(base64, mimeType, prompt, {
          lang,
          onProgress: (p, m) => setInteractiveState(prev => ({ ...prev, loadingProgress: p, loadingMessage: m })),
        });

        setInteractiveState({ analyzed: true, result, photo: base64 });
      } catch (err) {
        console.error("Analysis failed:", err);
        setInteractiveState({ analyzed: false, error: t.failedToGetResponse });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
    setPos({ x, y });

    if (step.interactiveType === 'SIMULATED_LENS') {
      const targets = step.interactiveData?.targets || [];
      targets.forEach((target: any) => {
        const dist = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
        if (dist < 15) {
          setInteractiveState((prev: any) => ({ ...prev, foundTarget: target.label }));
        }
      });
    }
    
    if (step.interactiveType === 'SIMULATED_QR' || step.interactiveType === 'SIMULATED_BUS_PAYMENT') {
        if (Math.abs(x - 50) < 15 && Math.abs(y - 50) < 15) {
            setInteractiveState((prev: any) => ({ ...prev, success: true }));
        }
    }
  };

  // Chat interaction logic
  const handleChatSend = async () => {
    const trimmedInput = chatInput.trim();
    if (!trimmedInput) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmedInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const { text: responseText } = await generateTextResponse(trimmedInput, false, false, { lang });
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: t.aiConnectionIssue }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Image generation logic
  const handleImageGen = async () => {
    if (!imageGenPrompt.trim()) return;

    setIsImageGenLoading(true);
    setGeneratedImageOutput(null);
    setImageGenError(null);

    try {
      const imgUrl = await generateNanoBananaImage(imageGenPrompt, { lang });
      setGeneratedImageOutput(imgUrl);
    } catch (error: any) {
      console.error("Image generation error:", error);
      setImageGenError(error.message || t.failedToGenerateImage);
    } finally {
      setIsImageGenLoading(false);
    }
  };

  const handleMapSearch = () => {
    if (!interactiveState.searchValue?.trim()) return;
    setInteractiveState(prev => ({ ...prev, searching: true, showSearchResults: false })); // Hide results while searching
    setTimeout(() => {
      const exampleLocations = step.interactiveData?.exampleSearchTerms || [t.coffeeShop, t.library, t.pharmacy];
      const foundTerm = exampleLocations.find((loc: string) => 
        loc.toLowerCase().includes(interactiveState.searchValue.toLowerCase())
      ) || interactiveState.searchValue; // If not found, use user's input

      setInteractiveState(prev => ({ 
        ...prev, 
        searching: false, 
        foundLocation: foundTerm,
        showSearchResults: true // Show results after search
      }));
    }, 1200);
  };

  const handleBrowserSearch = () => {
    if (!interactiveState.browserValue?.trim()) return;
    setInteractiveState(prev => ({ ...prev, searching: true }));
    setTimeout(() => {
      setInteractiveState(prev => ({ 
        ...prev, 
        searching: false, 
        showResults: true,
        url: `google.com/search?q=${encodeURIComponent(prev.browserValue)}`
      }));
    }, 1000);
  };

  const renderInteractive = () => {
    switch (step.interactiveType) {
      case 'LIVE_AI_CHAT':
        return (
          <div className="w-full bg-slate-50 rounded-[2rem] p-6 border-4 border-slate-100 shadow-xl flex flex-col h-[450px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {chatMessages.map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-xl shadow-sm text-base leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    <Markdown content={msg.text} className={msg.role === 'user' ? '[&_p]:text-white [&_strong]:text-blue-100' : ''} />
                  </div>
                </div>
              ))}
              {isChatLoading && (
                 <div className="flex justify-start">
                   <div className="bg-white px-4 py-3 rounded-xl rounded-tl-none shadow-sm border border-slate-100">
                     <div className="flex items-center gap-2">
                       <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                       </div>
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.thinkingDeeply}</span>
                     </div>
                   </div>
                 </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>
            <div className="pt-4 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder={t.typeMessage}
                className="flex-1 p-3 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 text-base font-medium text-slate-800 placeholder:text-slate-400"
                disabled={isChatLoading}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Button onClick={handleChatSend} disabled={!chatInput.trim() || isChatLoading} className="!p-3 !rounded-xl !bg-blue-600 hover:!bg-blue-700">
                <Send size={20} />
              </Button>
            </div>
          </div>
        );
      case 'SIMULATED_IMAGE_GENERATION':
        return (
          <div className="w-full bg-slate-50 rounded-[2rem] p-6 border-4 border-slate-100 shadow-xl space-y-6">
            <div className="space-y-4">
              <textarea
                value={imageGenPrompt}
                onChange={(e) => setImageGenPrompt(e.target.value)}
                placeholder={step.interactiveData?.placeholder || t.imageGenPlaceholder}
                className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none min-h-[100px] resize-none"
                dir={isRTL ? 'rtl' : 'ltr'}
                disabled={isImageGenLoading}
              />
              <Button 
                onClick={handleImageGen} 
                disabled={!imageGenPrompt.trim() || isImageGenLoading}
                fullWidth
                isLoading={isImageGenLoading}
                className="!bg-purple-600 hover:!bg-purple-700 !py-4 !text-xl !rounded-xl"
              >
                <Wand2 size={24} /> {t.createPicture}
              </Button>
            </div>

            {imageGenError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p className="font-bold">{imageGenError}</p>
              </div>
            )}

            {(generatedImageOutput || isImageGenLoading) && (
              <div className="bg-white p-6 rounded-[1.5rem] shadow-lg border border-slate-200 animate-fade-in space-y-4">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <ImageIcon size={24} className="text-purple-500" /> {t.yourPicture}
                </h3>
                <div className="aspect-square w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-100 flex items-center justify-center relative">
                  {isImageGenLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-sm z-10">
                      <Sparkles size={48} className="text-purple-400 animate-spin-slow" />
                      <p className="mt-4 text-purple-600 font-bold">{t.generatingImage}</p>
                    </div>
                  ) : (
                    <img 
                      src={generatedImageOutput!} 
                      alt={imageGenPrompt} 
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                {!isImageGenLoading && generatedImageOutput && (
                  <div className="flex gap-4">
                    <a href={generatedImageOutput} download={`doriai-generated-${Date.now()}.png`} className="flex-1">
                      <Button variant="secondary" fullWidth className="!py-3 !text-lg !rounded-lg">
                        <Download size={20} /> {t.saveToComputer}
                      </Button>
                    </a>
                    <Button variant="secondary" onClick={() => setGeneratedImageOutput(null)} className="!py-3 !text-lg !rounded-lg">
                      <RefreshCw size={20} /> {t.clear}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'SIMULATED_BROWSER':
        return (
          <div className="w-full bg-slate-200 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-xl">
            <div className="bg-slate-100 p-3 flex items-center gap-2 border-b-2 border-slate-300">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <Button variant="secondary" className="!p-1.5 !text-xs !rounded-lg"><ChevronLeft size={14} /></Button>
              <Button variant="secondary" className="!p-1.5 !text-xs !rounded-lg"><ChevronRight size={14} /></Button>
              <div className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-1 text-sm text-slate-400 truncate flex items-center gap-2 shadow-inner">
                 <Lock size={12} /> {interactiveState.url || 'google.com'}
              </div>
              <Button variant="secondary" className="!p-1.5 !text-xs !rounded-lg"><RefreshCw size={14} /></Button>
            </div>
            <div className="bg-white p-4 sm:p-8 min-h-[300px] flex flex-col items-center justify-center text-center space-y-6">
              {!interactiveState.showResults ? (
                <>
                  <div className="text-4xl font-black text-slate-800 flex items-center gap-2">
                     <span className="text-blue-600">G</span>
                     <span className="text-red-500">o</span>
                     <span className="text-yellow-500">o</span>
                     <span className="text-blue-600">g</span>
                     <span className="text-green-500">l</span>
                     <span className="text-red-500">e</span>
                  </div>
                  <div className="w-full max-w-md bg-white border-2 border-slate-100 rounded-full px-6 py-4 shadow-xl flex items-center gap-3">
                     <Search className="text-slate-300" />
                     <input 
                        type="text" 
                        value={interactiveState.browserValue || ''}
                        onChange={(e) => setInteractiveState({ ...interactiveState, browserValue: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleBrowserSearch()}
                        placeholder={t.browserUrlPlaceholder} 
                        className="flex-1 outline-none text-lg font-bold"
                     />
                     {interactiveState.searching && <RefreshCw size={18} className="animate-spin text-blue-500" />}
                  </div>
                </>
              ) : (
                <div className="w-full space-y-6 text-left animate-fade-in" dir="ltr">
                  <div className="border-b border-slate-100 pb-2 mb-4">
                    <p className="text-slate-500 text-sm">About 1,230,000 results (0.45 seconds)</p>
                  </div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-1">
                      <p className="text-emerald-700 text-sm truncate">www.example.com > {interactiveState.browserValue}</p>
                      <h4 className="text-blue-700 text-xl font-bold hover:underline cursor-pointer">{interactiveState.browserValue} - Official Site</h4>
                      <p className="text-slate-600 text-sm line-clamp-2">This is a simulated search result for {interactiveState.browserValue}. In a real browser, you would find many helpful links here.</p>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => setInteractiveState({})} className="!py-2 !px-4">
                    <RefreshCw size={16} className="mr-2" /> Search Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      case 'SIMULATED_PHARMACY':
        return (
          <div className="w-full bg-emerald-50 rounded-[2rem] p-8 border-4 border-emerald-100 shadow-xl space-y-6">
            <div className="flex items-center gap-4 border-b border-emerald-200 pb-4">
              <div className="bg-white p-3 rounded-2xl text-emerald-600 shadow-sm"><Pill size={32} /></div>
              <h3 className="text-2xl font-black text-emerald-900">{t.pharmacyTitle}</h3>
            </div>
            {!interactiveState.ordered ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-emerald-700 uppercase tracking-widest">{t.enterRx}</label>
                  <input 
                    type="text" 
                    placeholder={t.rxPlaceholder} 
                    className="w-full p-4 text-xl rounded-2xl border-2 border-emerald-100 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-white rounded-2xl border-2 border-emerald-100 font-bold text-emerald-800 hover:bg-emerald-100 transition-all flex flex-col items-center gap-2">
                    <Truck size={24} /> {t.homeDelivery}
                  </button>
                  <button className="p-4 bg-white rounded-2xl border-2 border-emerald-100 font-bold text-emerald-800 hover:bg-emerald-100 transition-all flex flex-col items-center gap-2">
                    <Home size={24} /> {t.pickup}
                  </button>
                </div>
                <Button onClick={() => setInteractiveState({ ordered: true })} fullWidth className="!bg-emerald-600 !py-6 !text-2xl !rounded-3xl shadow-xl">
                  {t.orderRefill}
                </Button>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4 animate-fade-in">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-2xl font-black text-emerald-900">{t.refillSuccess}</h4>
                <p className="text-emerald-700 font-bold">{t.refillConfirmation}</p>
              </div>
            )}
          </div>
        );
      case 'SIMULATED_MAP':
        return (
          <div className="w-full bg-slate-100 rounded-[2.5rem] p-6 border-4 border-white shadow-2xl space-y-4 overflow-hidden relative min-h-[400px]">
             {/* Dynamic Map Background */}
             <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 to-indigo-100">
               {/* Abstract "land" and "water" areas */}
               <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-100 opacity-60" /> {/* Water body */}
               <div className="absolute bottom-0 left-0 w-full h-1/2 bg-green-100 opacity-60" /> {/* Land mass */}
               
               {/* Simple road network */}
               <div className="absolute top-1/4 left-0 w-full h-8 bg-slate-300 opacity-80 transform -rotate-2" />
               <div className="absolute top-1/2 left-0 w-full h-8 bg-slate-300 opacity-80 transform rotate-3" />
               <div className="absolute left-1/4 top-0 h-full w-8 bg-slate-300 opacity-80 transform rotate-1" />
               <div className="absolute left-1/2 top-0 h-full w-8 bg-slate-300 opacity-80 transform -rotate-1" />

               {/* Textured overlay for realism */}
               <div className="absolute inset-0 bg-dots opacity-20" /> 
             </div>
             <div className="relative z-10 flex flex-col gap-4">
               <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-blue-50 flex items-center gap-3">
                 <MapPin className="text-red-500" size={24} />
                 <input 
                   type="text" 
                   value={interactiveState.searchValue || ''}
                   onChange={(e) => setInteractiveState(prev => ({ ...prev, searchValue: e.target.value, showSearchResults: false, foundLocation: null }))} // Clear results on new input
                   onKeyDown={(e) => e.key === 'Enter' && handleMapSearch()}
                   placeholder={t.findNearby} 
                   className="flex-1 outline-none text-lg font-bold text-slate-900 placeholder:text-slate-700 bg-transparent"
                 />
                 <Button onClick={handleMapSearch} disabled={!interactiveState.searchValue?.trim() || interactiveState.searching} className="!p-3 !rounded-xl">
                    {interactiveState.searching ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
                 </Button>
               </div>
               
               <div className="mt-20 flex flex-col items-center gap-2 transition-all duration-700 transform">
                 <div className={`bg-white p-3 rounded-2xl shadow-lg border border-slate-100 ${interactiveState.searching ? 'animate-pulse scale-110' : 'animate-bounce'}`}>
                    <MapPin className={`${interactiveState.searching ? 'text-blue-500' : 'text-red-500'}`} size={32} />
                 </div>
                 <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-slate-800 font-black text-sm shadow-md min-w-[100px] text-center">
                    {interactiveState.searching ? 'Searching...' : (interactiveState.foundLocation || t.centralPark)}
                 </div>
               </div>

               {/* New: Simulated Search Result Overlay */}
               {interactiveState.showSearchResults && interactiveState.foundLocation && !interactiveState.searching && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] bg-white p-5 rounded-2xl shadow-2xl border-2 border-blue-100 animate-fade-in z-20 flex items-center gap-4">
                   <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                     <Coffee size={24} /> {/* Example icon, could be dynamic based on result */}
                   </div>
                   <div className="flex-1">
                     <h4 className="text-xl font-black text-slate-800 leading-tight">{interactiveState.foundLocation}</h4>
                     <p className="text-sm text-slate-500">{t.simulatedMapResultText}</p>
                   </div>
                   <Button className="!p-3 !rounded-xl !bg-blue-600">
                     <Navigation size={20} />
                   </Button>
                 </div>
               )}
             </div>
          </div>
        );
      case 'SECURE_CHECKOUT':
        return (
          <div className="w-full bg-slate-50 rounded-[2rem] p-8 border-4 border-white shadow-xl space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black text-slate-800">{t.securePayment}</h3>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-slate-200 rounded" />
                <div className="w-10 h-6 bg-slate-300 rounded" />
              </div>
            </div>
            {!interactiveState.paid ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.cardNumber}</label>
                  <div className="w-full p-4 bg-white rounded-2xl border-2 border-slate-100 flex items-center gap-3 shadow-inner">
                    <CardIcon className="text-slate-300" />
                    <input type="text" placeholder="•••• •••• •••• ••••" className="flex-1 outline-none text-xl font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.expiry}</label>
                    <input type="text" placeholder="MM/YY" className="w-full p-4 bg-white rounded-2xl border-2 border-slate-100 outline-none font-mono text-xl shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.cvv}</label>
                    <input type="text" placeholder="•••" className="w-full p-4 bg-white rounded-2xl border-2 border-slate-100 outline-none font-mono text-xl shadow-inner" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={() => setInteractiveState({ paid: true })} fullWidth className="!py-6 !text-2xl !rounded-3xl shadow-xl !bg-blue-600">
                    <Lock size={24} className="mr-2" /> {t.payNow}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4 animate-fade-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={56} />
                </div>
                <h4 className="text-3xl font-black text-slate-800">{t.complete}</h4>
              </div>
            )}
          </div>
        );
      case 'SIMULATED_LENS':
        return (
          <div className="w-full rounded-[2.5rem] overflow-hidden aspect-square md:aspect-[4/3] relative bg-slate-200 border-4 border-white shadow-2xl" ref={containerRef} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={handleMove} onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={handleMove} style={{ touchAction: 'none' }}>
            <div className="absolute inset-0 z-0">
               <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                 <rect width="400" height="300" fill="#f8fafc" />
                 <circle cx="120" cy="180" r="40" fill="#cbd5e1" opacity="0.5" />
                 <rect x="250" y="80" width="80" height="120" rx="10" fill="#e2e8f0" />
                 <text x="30" y="55" fontSize="20" fontWeight="900" fill="#94a3b8">SCAM TEST</text>
                 <circle cx="120" cy="180" r="15" fill="#ef4444" opacity="0.1" />
               </svg>
            </div>
            <div className={`absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-orange-500 bg-white/10 shadow-[0_0_50px_rgba(249,115,22,0.4)] pointer-events-none transition-all duration-100 z-10 flex items-center justify-center`} style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}>
               <div className="w-full h-full rounded-full border-2 border-white/50 flex items-center justify-center">
                  <Search size={40} className="text-orange-500" />
               </div>
            </div>
            {interactiveState.foundTarget && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl border-2 border-orange-500 z-20 animate-bounce">
                <span className="text-orange-600 font-black text-lg">{interactiveState.foundTarget}</span>
              </div>
            )}
            <div className="absolute bottom-6 inset-x-0 text-center z-20">
              <span className="bg-slate-900/80 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest">{t.scanningScams}</span>
            </div>
          </div>
        );
      case 'SIMULATED_QR':
      case 'SIMULATED_BUS_PAYMENT':
        return (
          <div className="w-full rounded-[2.5rem] overflow-hidden aspect-square relative bg-slate-900 border-4 border-white shadow-2xl flex items-center justify-center" ref={containerRef} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={handleMove} onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={handleMove} style={{ touchAction: 'none' }}>
             {!interactiveState.success ? (
               <>
                <div className="absolute inset-0 opacity-40">
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <rect x="40" y="40" width="20" height="20" fill="white" />
                    <rect x="42" y="42" width="16" height="16" fill="black" />
                    <rect x="44" y="44" width="6" height="6" fill="white" />
                  </svg>
                </div>
                <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative flex items-center justify-center">
                   <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
                   <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
                   <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
                   <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500" />
                   <Camera size={48} className="text-white opacity-20" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-blue-400 rounded-3xl pointer-events-none" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />
               </>
             ) : (
               <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 animate-fade-in text-center">
                 <div className="bg-green-100 p-6 rounded-full text-green-600 shadow-inner">
                   <CheckCircle2 size={64} />
                 </div>
                 <div>
                   <h3 className="text-3xl font-black text-slate-800">{step.interactiveType === 'SIMULATED_BUS_PAYMENT' ? t.ridePaid : t.qrCodeScanned}</h3>
                   <p className="text-slate-500 font-bold mt-2">{t.complete}</p>
                 </div>
               </div>
             )}
          </div>
        );
      case 'SIMULATED_BUREAUCRACY':
        return (
          <div className="w-full space-y-6">
            <input 
              type="file" 
              ref={bureaucracyFileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleBureaucracyFileSelect} 
            />
            
            {interactiveState.loading ? (
              <div className="space-y-8">
                <div className="relative rounded-[2rem] overflow-hidden border-4 border-orange-100 aspect-video bg-slate-50 shadow-inner">
                  <div className="scanning-beam" /> {/* Assuming scanning-beam is defined in CSS */}
                  {(interactiveState.photo || interactiveState.text) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
                      <div className="bg-white/90 p-4 rounded-2xl flex items-center gap-3 shadow-lg border border-orange-100">
                        <Sparkles className="text-orange-500 animate-spin" size={24} />
                        <span className="text-orange-600 font-black uppercase tracking-widest text-sm">
                          {interactiveState.loadingMessage}
                        </span>
                      </div>
                    </div>
                  )}
                  {interactiveState.photo && <img src={interactiveState.photo} alt="Scanning" className="w-full h-full object-cover opacity-30 grayscale" />}
                  {interactiveState.text && <div className="p-8 text-slate-300 font-medium overflow-hidden h-full">{interactiveState.text}</div>}
                </div>
                <LoadingBar message={interactiveState.loadingMessage} progress={interactiveState.loadingProgress} lang={lang} estimatedDuration={10000} />
              </div>
            ) : !interactiveState.analyzed ? (
              <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center space-y-6">
                <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-orange-600 shadow-inner">
                  <FileText size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">{t.scanLetter}</h3>
                  <p className="text-lg text-slate-500 font-bold">{t.takeDocPhoto}</p>
                </div>
                <Button 
                  onClick={() => bureaucracyFileInputRef.current?.click()}
                  className="!py-6 !px-12 !rounded-3xl !bg-orange-600 shadow-xl"
                >
                  <Camera size={32} /> {t.scanLetter}
                </Button>
                {interactiveState.error && (
                  <p className="text-red-500 font-bold">{interactiveState.error}</p>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {interactiveState.photo && (
                  <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden border-2 border-slate-100 shadow-inner">
                    <img src={interactiveState.photo} alt="Doc preview" className="w-full h-full object-contain bg-slate-100" />
                  </div>
                )}
                
                <div className="bg-white p-8 rounded-[2rem] border-2 border-orange-100 shadow-lg space-y-6">
                   <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <Sparkles className="text-orange-500" size={28} /> {t.noJargon}
                   </h4>
                   <div className="text-xl text-slate-600 leading-relaxed font-bold">
                      <Markdown content={interactiveState.result} />
                   </div>
                </div>

                <Button variant="secondary" onClick={() => setInteractiveState({})} className="w-full !rounded-2xl !py-4">
                  <RefreshCw size={20} className="mr-2" /> {t.startOverNewPhoto}
                </Button>
              </div>
            )}
          </div>
        );
      default: 
        return null; // For informational steps, render nothing as interactive.
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 pb-20 px-4 pt-4 md:pt-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
          {isRTL ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} {t.backToHub}
        </button>
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border border-blue-100">
          {t.step} {stepIndex + 1} / {lesson.steps.length}
        </span>
      </div>
      
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[4rem] shadow-xl border border-slate-50 relative overflow-hidden">
        <div className="absolute -top-4 -right-2 md:-top-10 md:-right-4 z-30">
          <BirdAssistant />
        </div>
        
        <div className="mb-6">
          <ProgressBar current={stepIndex + 1} total={lesson.steps.length} label={lesson.title} />
        </div>
        
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-1 md:space-y-3">
            <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">{step.title}</h2>
            <div className="text-base md:text-xl text-slate-500 leading-relaxed font-bold opacity-80">{step.content}</div>
          </div>
          
          <div className="relative z-10">
            {renderInteractive()}
          </div>
        </div>
        
        <div className="mt-8 md:mt-12 flex justify-between items-center pt-6 border-t border-slate-50">
          <Button 
            variant="secondary" 
            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} 
            disabled={stepIndex === 0}
            className="!py-3 !px-4 md:!px-8 !text-sm md:!text-lg !rounded-xl"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />} {t.prev}
          </Button>
          <Button 
            onClick={handleNext}
            className="!py-3 !px-6 md:!px-12 !text-base md:!text-xl !rounded-xl shadow-lg"
          >
            {isLastStep ? t.finish : t.next} {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
