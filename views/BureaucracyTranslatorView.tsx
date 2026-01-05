import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/Button';
import { LoadingBar } from '../components/LoadingBar';
import { Language } from '../types';
import { UI_STRINGS } from '../i18n/translations';
import { Camera, X, ClipboardCheck, AlertTriangle, Calendar, CheckSquare, Info, ShieldAlert, Type, Image as ImageIcon, Sparkles, Wand2, Key } from 'lucide-react';

interface AnalysisResult {
  docType: string;
  urgency: 'high' | 'medium' | 'low';
  summary: string;
  plainEnglish: string;
  importantDates: string[];
  checklist: string[];
}

export const BureaucracyTranslatorView: React.FC<{lang: Language}> = ({lang}) => {
  const t = UI_STRINGS[lang];
  const [inputMethod, setInputMethod] = useState<'photo' | 'text' | 'generate' | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkStatus();
  }, []);

  const handleOpenKeyDialog = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasKey(true);
      setError(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMimeType(file.type);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSample = async () => {
    if (!hasKey) {
      await handleOpenKeyDialog();
      return;
    }

    setIsLoading(true);
    setError(null);
    setInputMethod('photo'); // Transition to photo view once generated

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const languageName = lang === 'he' ? 'Hebrew' : 'English';
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ 
            text: `A very simple, clear official notice on a wooden table. The paper has very large, bold, easy-to-read text in ${languageName}. Simple layout with clear sections, large font size, and high contrast. No fine print or crowded text. Professional but extremely legible. No hands visible.` 
          }],
        },
        config: {
          imageConfig: { aspectRatio: "3:4" }
        },
      });

      let imageData = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageData) {
        setSelectedImage(imageData);
        setMimeType('image/png');
      } else {
        throw new Error("No image generated");
      }
    } catch (err) {
      console.error("Sample generation error:", err);
      setError(t.failedToCreateImage);
      setInputMethod(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!selectedImage && !pastedText.trim()) return;

    setIsLoading(true);
    setError(null);

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
      
      if (selectedImage) {
        const base64Data = selectedImage.split(',')[1];
        contents.push({
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Data } },
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
    } catch (error) {
      console.error("Translation error:", error);
      setError(t.failedToGetResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
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
                    {inputMethod === 'generate' ? t.generatingSample : t.analyzingDoc}
                  </span>
                </div>
              </div>
            </div>
            <LoadingBar message={inputMethod === 'generate' ? t.generatingSample : t.analyzingDoc} lang={lang} estimatedDuration={inputMethod === 'generate' ? 12000 : 10000} />
          </div>
        ) : analysis ? (
          <div className="space-y-8 animate-fade-in">
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
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
                <h4 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Info size={24} className="text-blue-500" /> {t.noJargon}
                </h4>
                <div className="text-lg font-medium text-slate-700 leading-relaxed">
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

            <div className="flex gap-4">
              <Button onClick={resetAll} variant="secondary" fullWidth className="!py-6 !text-xl !rounded-2xl">
                {t.startOverNewPhoto}
              </Button>
            </div>
          </div>
        ) : !inputMethod ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={() => setInputMethod('photo')}
              className="border-4 border-slate-100 rounded-[2.5rem] p-10 text-center hover:border-orange-500 hover:bg-orange-50 transition-all group flex flex-col items-center gap-4"
            >
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-inner">
                <Camera size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800">{t.scanLetter}</h3>
                <p className="text-base text-slate-500 font-medium">{t.takeDocPhoto}</p>
              </div>
            </button>

            <button 
              onClick={() => setInputMethod('text')}
              className="border-4 border-slate-100 rounded-[2.5rem] p-10 text-center hover:border-blue-500 hover:bg-blue-50 transition-all group flex flex-col items-center gap-4"
            >
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
                <Type size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800">{t.pasteText}</h3>
                <p className="text-base text-slate-500 font-medium">{t.enterTextHere}</p>
              </div>
            </button>

            <button 
              onClick={() => { setInputMethod('generate'); handleGenerateSample(); }}
              className="sm:col-span-2 border-4 border-slate-100 rounded-[2.5rem] p-10 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex flex-col items-center gap-4 bg-slate-50/50"
            >
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-inner">
                <Wand2 size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800">{t.generateSample}</h3>
                <p className="text-base text-slate-500 font-medium max-w-sm mx-auto">{t.needApiKeyForSample}</p>
              </div>
            </button>
          </div>
        ) : inputMethod === 'photo' ? (
          <div className="space-y-6 animate-fade-in">
             {!selectedImage ? (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="border-4 border-dashed border-slate-200 rounded-[2rem] p-16 text-center cursor-pointer hover:bg-slate-50 hover:border-orange-300 transition-all group shadow-inner"
               >
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                 <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                   <ImageIcon size={40} className="text-orange-500" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-700 mb-3">{t.uploadPhoto}</h3>
                 <p className="text-xl text-slate-500 max-w-md mx-auto">{t.takeDocPhoto}</p>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="aspect-[4/5] relative rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-inner max-w-md mx-auto">
                   <img src={selectedImage} alt="Document" className="w-full h-full object-cover" />
                   <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-lg text-slate-600">
                     <X size={24} />
                   </button>
                 </div>
                 <Button onClick={handleTranslate} fullWidth className="!py-8 !text-2xl !rounded-3xl shadow-xl shadow-orange-100">
                   <ShieldAlert size={32} /> {t.translateDoc || "Translate Document"}
                 </Button>
               </div>
             )}
             <Button variant="secondary" onClick={() => setInputMethod(null)} className="w-full !rounded-2xl !py-4">{t.back}</Button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-[2rem] border-4 border-blue-50 shadow-inner focus-within:border-blue-400 transition-all">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={t.enterTextHere}
                className="w-full min-h-[300px] bg-transparent text-xl font-medium outline-none text-slate-800 placeholder:text-slate-300 p-2 leading-relaxed"
              />
            </div>
            <Button onClick={handleTranslate} disabled={!pastedText.trim()} fullWidth className="!py-8 !text-2xl !rounded-3xl shadow-xl shadow-blue-100 !bg-blue-600 hover:!bg-blue-700">
              <ShieldAlert size={32} /> {t.analyzeText}
            </Button>
            <Button variant="secondary" onClick={() => setInputMethod(null)} className="w-full !rounded-2xl !py-4">{t.back}</Button>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 p-6 rounded-2xl border-2 border-red-100 text-red-700 font-black flex items-center gap-3">
            <AlertTriangle /> {error}
          </div>
        )}
      </div>
    </div>
  );
};
