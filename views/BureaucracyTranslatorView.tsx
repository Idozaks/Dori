
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/Button';
import { LoadingBar } from '../components/LoadingBar';
import { Language } from '../types';
import { UI_STRINGS } from '../i18n/translations';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { 
  Camera, X, ClipboardCheck, AlertTriangle, Calendar, CheckSquare, Info, 
  ShieldAlert, Type, Image as ImageIcon, Sparkles, Volume2, StopCircle, RefreshCw, ArrowRight 
} from 'lucide-react';

interface AnalysisResult {
  docType: string;
  urgency: 'high' | 'medium' | 'low';
  summary: string;
  plainEnglish: string;
  importantDates: string[];
  checklist: string[];
}

interface BureaucracyTranslatorViewProps {
  lang: Language;
  onStartGuidedPath?: (goal: string) => void;
}

export const BureaucracyTranslatorView: React.FC<BureaucracyTranslatorViewProps> = ({ lang, onStartGuidedPath }) => {
  const t = UI_STRINGS[lang];
  const [inputMethod, setInputMethod] = useState<'photo' | 'text' | 'camera' | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setMimeType(file.type);
        setAnalysis(null);
        setError(null);
        // Automatically trigger translation once image is selected/shot
        handleTranslate(result, file.type);
      };
      reader.readAsDataURL(file);
    } else {
      // If user cancels file picker, reset input method to show grid again
      setInputMethod(null);
    }
  };

  const stopAudio = () => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch (e) {}
      currentAudioSourceRef.current.disconnect();
      currentAudioSourceRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const playAnalysisAudio = async () => {
    if (!analysis) return;
    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    setIsPlayingAudio(true);
    try {
      const textToRead = `${analysis.docType}. ${analysis.plainEnglish}`;
      const base64Audio = await generateSpeech(textToRead, 'Zephyr', { lang });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start(0);
      currentAudioSourceRef.current = source;
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlayingAudio(false);
    }
  };

  const handleTranslate = async (imageOverride?: string, mimeOverride?: string) => {
    const imgToUse = imageOverride || selectedImage;
    const mimeToUse = mimeOverride || mimeType;

    if (!imgToUse && !pastedText.trim()) return;

    setIsLoading(true);
    setError(null);

    // Analytics: Track translator start
    console.log('[Analytics] bureaucracy_translator_start', { method: inputMethod });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemPrompt = `You are an expert Bureaucracy Translator for elderly people. 
      Analyze the following document content. Bypass legal jargon and explain it in extremely simple terms.
      
      Return a JSON object with this structure:
      {
        "docType": "Short name of the document",
        "urgency": "high" | "medium" | "low",
        "summary": "One sentence summary",
        "plainEnglish": "Detailed explanation in very simple language",
        "importantDates": ["Date 1: what happens", "Date 2: what happens"],
        "checklist": ["Step 1 to take", "Step 2 to take"]
      }
      
      Urgency levels: 
      - high: Payment due within 7 days, legal threat, or service cutoff.
      - medium: Informational with action required in 30 days.
      - low: Purely informational/record keeping.
      
      Respond in ${lang === 'he' ? 'Hebrew' : 'English'}.`;

      const contents: any[] = [];
      
      if (imgToUse) {
        const base64Data = imgToUse.split(',')[1];
        contents.push({
          parts: [
            { inlineData: { mimeType: mimeToUse, data: base64Data } },
            { text: systemPrompt }
          ]
        });
      } else {
        contents.push({
          parts: [{ text: `${systemPrompt}\n\nDocument text to analyze:\n${pastedText}` }]
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          thinkingConfig: { thinkingBudget: 16000 },
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || "{}");
      setAnalysis(result);
      
      // Analytics: Track success
      console.log('[Analytics] bureaucracy_translator_complete', { docType: result.docType, urgency: result.urgency });
    } catch (error) {
      console.error("Translation error:", error);
      setError(t.failedToGetResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGuidedPath = () => {
    if (!analysis || !onStartGuidedPath) return;
    
    // Analytics: Track transition to guided execution
    console.log('[Analytics] start_guided_execution_from_translator', { goal: analysis.docType });
    
    const goal = `${t.startGuidedExecution}: ${analysis.docType} - ${analysis.summary}`;
    onStartGuidedPath(goal);
  };

  const resetAll = () => {
    stopAudio();
    setAnalysis(null);
    setSelectedImage(null);
    setPastedText('');
    setInputMethod(null);
    setError(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4">
      <style>{`
        @keyframes scan-vertical {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scanning-beam {
          position: absolute;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(to bottom, transparent, #f97316, transparent);
          box-shadow: 0 0 20px #f97316;
          z-index: 20;
          animation: scan-vertical 2s linear infinite;
        }
      `}</style>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shadow-inner">
            <ClipboardCheck size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{t.bureaucracyTranslator}</h2>
            <p className="text-xl text-slate-500 font-medium">{t.bureaucracyDesc}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="relative rounded-[2rem] overflow-hidden border-4 border-orange-100 aspect-video bg-slate-50">
              <div className="scanning-beam" />
              {selectedImage && (
                <img src={selectedImage} alt="Scanning" className="w-full h-full object-cover opacity-30 grayscale" />
              )}
              {pastedText && (
                <div className="p-8 text-slate-300 font-medium overflow-hidden h-full">
                  {pastedText}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-3 shadow-lg border border-orange-100">
                  <Sparkles className="text-orange-500 animate-spin" size={24} />
                  <span className="text-orange-600 font-black uppercase tracking-widest text-sm">
                    {t.analyzingDoc}
                  </span>
                </div>
              </div>
            </div>
            <LoadingBar message={t.analyzingDoc} lang={lang} estimatedDuration={10000} />
          </div>
        ) : analysis ? (
          <div className="space-y-8 animate-fade-in">
            {selectedImage && (
              <div className="relative rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-xl max-h-[400px]">
                <img src={selectedImage} alt="Scanned Document" className="w-full h-full object-contain bg-slate-50" />
                <button 
                  onClick={playAnalysisAudio}
                  className="absolute bottom-6 right-6 p-5 bg-orange-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-30"
                  title={t.readAloud}
                >
                  {isPlayingAudio ? <StopCircle size={32} /> : <Volume2 size={32} />}
                </button>
              </div>
            )}

            <div className={`p-6 rounded-[2rem] border-4 flex items-center gap-4 ${getUrgencyColor(analysis.urgency)}`}>
              <AlertTriangle size={32} />
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest opacity-70">{t.documentType}: {analysis.docType}</p>
                <h3 className="text-2xl font-black">
                  {analysis.urgency === 'high' ? t.highUrgency : analysis.urgency === 'medium' ? t.mediumUrgency : t.lowUrgency}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Info size={24} className="text-blue-500" /> {t.noJargon}
                  </h4>
                </div>
                <div className="text-xl font-bold text-slate-700 leading-relaxed italic">
                  "{analysis.summary}"
                </div>
                <div className="mt-4 text-lg font-medium text-slate-600 leading-relaxed">
                  {analysis.plainEnglish}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-100 shadow-xl shadow-blue-50">
                <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <CheckSquare size={24} className="text-green-500" /> {t.checklist}
                </h4>
                <div className="space-y-4">
                  {analysis.checklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-md border-2 border-blue-300 mt-1 flex-shrink-0" />
                      <p className="text-lg font-bold text-slate-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {analysis.importantDates.length > 0 && (
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100">
                <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <Calendar size={24} className="text-orange-500" /> {t.importantDates}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysis.importantDates.map((date, i) => (
                    <div key={i} className="p-4 bg-orange-50 rounded-2xl border border-orange-100 font-black text-orange-900">
                      {date}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <Button onClick={handleStartGuidedPath} className="!py-8 !text-2xl !rounded-3xl !bg-blue-600 hover:!bg-blue-700 shadow-xl shadow-blue-100">
                <ArrowRight className="mr-3" /> {t.startGuidedPath}
              </Button>
              <Button onClick={resetAll} variant="secondary" className="!py-8 !text-xl !rounded-3xl shadow-md">
                <RefreshCw size={24} className="mr-2" /> {t.startOverNewPhoto}
              </Button>
            </div>
          </div>
        ) : inputMethod === 'text' ? (
          <div className="space-y-6">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={t.enterTextHere}
              className="w-full p-6 text-xl border-4 border-slate-100 rounded-[2rem] min-h-[300px] outline-none focus:border-blue-500 transition-all shadow-inner"
            />
            <div className="flex gap-4">
              <Button onClick={() => setInputMethod(null)} variant="secondary" className="flex-1 !py-5 shadow-md">
                {t.back}
              </Button>
              <Button onClick={() => handleTranslate()} disabled={!pastedText.trim()} className="flex-1 !py-5 shadow-lg">
                {t.analyzeText}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={() => { setInputMethod('camera'); setTimeout(() => cameraInputRef.current?.click(), 100); }}
              className="border-4 border-slate-100 rounded-[2.5rem] p-10 text-center hover:border-orange-500 hover:bg-orange-50 transition-all group flex flex-col items-center gap-4 shadow-sm active:scale-95"
            >
              <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-inner">
                <Camera size={48} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800">{t.takePhoto}</h3>
                <p className="text-lg text-slate-500 font-medium">{t.takeDocPhoto}</p>
              </div>
              <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileSelect} />
            </button>

            <button 
              onClick={() => { setInputMethod('photo'); setTimeout(() => fileInputRef.current?.click(), 100); }}
              className="border-4 border-slate-100 rounded-[2.5rem] p-10 text-center hover:border-blue-500 hover:bg-blue-50 transition-all group flex flex-col items-center gap-4 shadow-sm active:scale-95"
            >
              <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
                <ImageIcon size={48} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800">{t.uploadPhoto}</h3>
                <p className="text-lg text-slate-500 font-medium">{t.uploadPhotoForEditOrAnalysis}</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            </button>

            <button 
              onClick={() => setInputMethod('text')}
              className="border-4 border-slate-100 rounded-[2.5rem] p-10 text-center hover:border-blue-500 hover:bg-blue-50 transition-all group flex flex-col items-center gap-4 sm:col-span-2 shadow-sm active:scale-95"
            >
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform shadow-inner">
                <Type size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800">{t.pasteText}</h3>
                <p className="text-base text-slate-500 font-medium">{t.enterTextHere}</p>
              </div>
            </button>
          </div>
        )}
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
