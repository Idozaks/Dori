import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Language } from '../types';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { UI_STRINGS } from '../i18n/translations';
import { ChevronLeft, ChevronRight, Sparkles, Send, Search, Mic, MicOff, Video, VideoOff, PhoneOff, Lock, Unlock, QrCode, MapPin, Navigation, Map as MapIcon, Info, Globe, Camera, Smartphone, Move } from 'lucide-react';

interface LessonDetailViewProps {
  lesson: Lesson;
  onFinish: (id: string) => void;
  onBack: () => void;
  lang: Language;
}

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
  const [voiceHeard, setVoiceHeard] = useState(false);
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'IDLE' | 'CHECKING' | 'SUCCESS'>('IDLE');
  
  // QR Simulation Drag State
  const [qrPos, setQrPos] = useState({ x: 50, y: 50 }); // Viewfinder position in %
  const [isDragging, setIsDragging] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (micOn && videoOn) {
      const timer = setTimeout(() => setCallSuccess(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [micOn, videoOn]);

  const handleNext = () => {
    if (isLastStep) {
      onFinish(lesson.id);
    } else {
      setStepIndex(stepIndex + 1);
      setQuizAnswer(null);
      setQuizCorrect(null);
      setSearchInput('');
      setSearchSuccess(false);
      setMicOn(false);
      setVideoOn(false);
      setCallSuccess(false);
      setCheckoutStatus('IDLE');
      setQrSuccess(false);
      setQrPos({ x: 50, y: 50 });
      setVoiceHeard(false);
      setVoiceSuccess(false);
      setEmailSent(false);
      setMapSearch('');
      setMapIframeUrl(null);
      setMapHasResult(false);
    }
  };

  const handleQRMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || qrSuccess || !qrContainerRef.current) return;
    
    const rect = qrContainerRef.current.getBoundingClientRect();
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

    // Clamp values
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setQrPos({ x: clampedX, y: clampedY });

    // Target is at 50, 50 (center)
    const distance = Math.sqrt(Math.pow(clampedX - 50, 2) + Math.pow(clampedY - 50, 2));
    if (distance < 12) {
      setQrSuccess(true);
      setIsDragging(false);
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
    const newUrl = `https://www.google.com/maps?q=${encodedQuery}&output=embed&z=15`;
    setMapIframeUrl(newUrl);
    if (trimmed.toLowerCase().includes(step.interactiveData.targetSearch.toLowerCase())) {
      setMapHasResult(true);
    }
  };

  const renderInteractive = () => {
    switch (step.interactiveType) {
      case 'SIMULATED_QR':
        return (
          <div className="mt-10 bg-slate-200 rounded-[2.5rem] border-4 border-slate-300 overflow-hidden shadow-2xl relative aspect-square flex items-center justify-center cursor-none select-none"
               ref={qrContainerRef}
               onMouseMove={handleQRMove}
               onTouchMove={handleQRMove}
               onMouseDown={() => !qrSuccess && setIsDragging(true)}
               onMouseUp={() => setIsDragging(false)}
               onTouchStart={() => !qrSuccess && setIsDragging(true)}
               onTouchEnd={() => setIsDragging(false)}
          >
            {/* Background Texture (Table) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            
            {/* The Target QR Code (Centered) */}
            <div className={`p-8 bg-white rounded-3xl shadow-xl transition-all duration-500 ${qrSuccess ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
              <QrCode size={140} className="text-slate-800" />
            </div>

            {/* Virtual Smartphone / Viewfinder */}
            {!qrSuccess && (
              <div 
                className={`absolute pointer-events-none transition-transform duration-75 flex flex-col items-center justify-center ${isDragging ? 'scale-110' : 'scale-100'}`}
                style={{ 
                  left: `${qrPos.x}%`, 
                  top: `${qrPos.y}%`, 
                  transform: `translate(-50%, -50%)` 
                }}
              >
                {/* Smartphone Frame */}
                <div className="w-56 h-96 bg-slate-900 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                  <div className="h-6 w-20 bg-slate-700 rounded-full mx-auto mt-3 mb-2" />
                  <div className="flex-1 bg-blue-50/10 relative">
                    {/* Inner Viewfinder box */}
                    <div className="absolute inset-8 border-4 border-dashed border-white/60 rounded-2xl flex items-center justify-center">
                      <div className="w-full h-0.5 bg-blue-400 absolute animate-[scan_2s_infinite]" />
                      <Camera size={40} className="text-white/30" />
                    </div>
                  </div>
                  <div className="h-12 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-600" />
                  </div>
                </div>
                
                {/* Drag Prompt */}
                {!isDragging && (
                  <div className="mt-6 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce">
                    <Move size={20} className="text-blue-600" />
                    <span className="text-lg font-black text-slate-700">
                      {lang === 'en' ? 'Drag to scan code' : 'גררו כדי לסרוק'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Success Overlay */}
            {qrSuccess && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm animate-fade-in">
                <div className="text-center p-12 bg-white rounded-[3rem] border-4 border-green-500 shadow-2xl animate-scale-up">
                  <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 shadow-inner">
                    <Sparkles size={64} />
                  </div>
                  <h4 className="text-4xl font-black text-slate-800 mb-4">{lang === 'en' ? 'Scan Successful!' : 'הסריקה הצליחה!'}</h4>
                  <p className="text-2xl text-slate-600">{lang === 'en' ? 'Opening the menu...' : 'פותח את התפריט...'}</p>
                </div>
              </div>
            )}

            <style>{`
              @keyframes scan {
                0% { top: 10%; }
                50% { top: 90%; }
                100% { top: 10%; }
              }
              @keyframes scale-up {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        );

      case 'SIMULATED_MAP':
        return (
          <div className="mt-10 bg-white rounded-[2.5rem] border-4 border-slate-200 shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="bg-white p-6 border-b-2 border-slate-100 shadow-sm relative z-20">
               <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 border-2 border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
                    <Search size={24} className="text-slate-400" />
                    <input type="text" value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleMapSearch()} placeholder={lang === 'en' ? 'Search Google Maps...' : 'חפשו במפות גוגל...'} className="w-full bg-transparent py-5 px-3 text-2xl font-bold outline-none placeholder:text-slate-400" style={{ textAlign: isRTL ? 'right' : 'left' }} />
                  </div>
                  <Button onClick={handleMapSearch} className="!p-5 !rounded-2xl !bg-blue-600 shadow-lg shadow-blue-100"><Navigation size={28} className={isRTL ? 'rotate-180' : ''} /></Button>
               </div>
               {!mapHasResult && <p className="mt-3 text-slate-500 font-bold text-lg flex items-center gap-2"><Info size={18} /> {lang === 'en' ? `Try searching for '${step.interactiveData.targetSearch}'` : `נסו לחפש את המילה '${step.interactiveData.targetSearch}'`}</p>}
            </div>
            <div className="flex-1 bg-slate-50 relative min-h-[400px]">
              {mapIframeUrl ? <iframe title="Google Maps" width="100%" height="100%" frameBorder="0" style={{ border: 0, minHeight: '400px' }} src={mapIframeUrl} allowFullScreen className="animate-fade-in"></iframe> : <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center opacity-60"><div className="bg-slate-200 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-slate-400"><Globe size={48} /></div><p className="text-2xl font-black text-slate-400 max-w-sm">{lang === 'en' ? 'Use the search bar above to see the interactive map.' : 'השתמשו בשורת החיפוש למעלה כדי לראות את המפה האינטראקטיבית.'}</p></div>}
              {mapHasResult && <div className="absolute bottom-6 right-6 z-30 animate-bounce"><div className="bg-green-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-black text-xl"><Sparkles /> {lang === 'en' ? 'Found it!' : 'מצאתם!'}</div></div>}
            </div>
          </div>
        );

      case 'SIMULATED_EMAIL':
        return (
          <div className="mt-10 bg-white rounded-[2rem] border-4 border-slate-200 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 p-4 text-white text-base font-black flex items-center justify-between">
              <div className="flex gap-1.5"><div className="w-4 h-4 rounded-full bg-red-400" /><div className="w-4 h-4 rounded-full bg-yellow-400" /><div className="w-4 h-4 rounded-full bg-green-400" /></div>
              <span className="opacity-80 uppercase tracking-widest text-sm">{lang === 'en' ? 'New Message' : 'הודעה חדשה'}</span>
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
                  <input className="flex-1 outline-none font-bold text-2xl bg-white" placeholder="example@mail.com" value={emailTo} onChange={e => setEmailTo(e.target.value)} dir="ltr" />
                </div>
                <div className={`flex items-center border-b-2 border-slate-100 py-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <span className={`w-24 text-slate-400 font-black text-xl`}>{lang === 'en' ? 'Subject:' : 'נושא:'}</span>
                  <input className="flex-1 outline-none font-bold text-2xl bg-white" placeholder={lang === 'en' ? 'Enter subject' : 'הזינו נושא'} value={emailSub} onChange={e => setEmailSub(e.target.value)} />
                </div>
                <textarea className="w-full h-56 mt-4 outline-none resize-none text-2xl p-6 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-blue-200" placeholder={lang === 'en' ? 'Type your message here...' : 'כתבו את ההודעה כאן...'} value={emailBody} onChange={e => setEmailBody(e.target.value)} style={{ textAlign: isRTL ? 'right' : 'left' }} />
                <Button onClick={() => setEmailSent(true)} disabled={!emailTo || !emailSub || !emailBody} className="mt-4 !py-5 !rounded-2xl !text-2xl w-full !bg-blue-600 shadow-lg">
                  <Send size={28} /> {lang === 'en' ? 'Send Letter' : 'שליחת מכתב'}
                </Button>
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
              <h1 className="text-5xl font-black tracking-tight mb-8">
                <span className="text-blue-600">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-600">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span>
              </h1>
              {searchSuccess ? (
                <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-200 animate-fade-in"><p className="text-green-700 text-xl font-black">{lang === 'en' ? "Perfect! That would find exactly what you need." : "מעולה! זה ימצא בדיוק מה שחיפשתם."}</p></div>
              ) : (
                <div className="max-w-md mx-auto relative group">
                  <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkSearch()} placeholder={step.interactiveData.placeholder} className="w-full pl-12 pr-6 py-5 rounded-full border-2 border-slate-200 text-2xl" style={{ textAlign: isRTL ? 'right' : 'left' }} />
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
            <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center transition-all ${voiceHeard ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
              <Mic size={64} />
            </div>
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
              <Button onClick={() => { setCheckoutStatus('CHECKING'); setTimeout(() => setCheckoutStatus('SUCCESS'), 1500); }} isLoading={checkoutStatus === 'CHECKING'} className="!w-full !py-6 !text-2xl !bg-green-600">
                <Lock size={24} /> {lang === 'en' ? 'Pay Now' : 'שלם עכשיו'}
              </Button>
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
              <button key={i} onClick={() => checkQuiz(i)} className={`w-full p-6 rounded-3xl border-4 text-left text-2xl font-black transition-all ${quizAnswer === i ? (quizCorrect ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50') : 'border-slate-100 bg-slate-50'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>{opt}</button>
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

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-slate-50">
        <ProgressBar current={stepIndex + 1} total={lesson.steps.length} />
        <div className="mt-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-8 leading-tight">{step.title}</h2>
          <div className="prose-xl text-slate-700 leading-relaxed mb-12 text-2xl font-medium">{renderContentWithLTR(step.content)}</div>
          {renderInteractive()}
        </div>
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
              (step.interactiveType === 'SIMULATED_QR' && !qrSuccess) || 
              (step.interactiveType === 'SIMULATED_VOICE' && !voiceSuccess) || 
              (step.interactiveType === 'SECURE_CHECKOUT' && checkoutStatus !== 'SUCCESS') || 
              (step.interactiveType === 'SIMULATED_EMAIL' && !emailSent) ||
              (step.interactiveType === 'SIMULATED_MAP' && !mapHasResult)
            } 
            className="!px-10 !py-5 !rounded-2xl !text-2xl"
          >
            {isLastStep ? t.finish : t.next} {isRTL ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
