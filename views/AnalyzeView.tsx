
import React, { useState, useRef, useEffect } from 'react';
import { analyzeImageContent, editImage, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Button } from '../components/Button';
import { Markdown } from '../components/Markdown';
import { Camera, Upload, Search, X, Wand2, Image as ImageIcon, Download, RefreshCcw, Volume2, StopCircle, Type, Sparkles, AlertCircle } from 'lucide-react';
import { LoadingBar } from '../components/LoadingBar';
import { Language } from '../types';
import { UI_STRINGS } from '../i18n/translations';

export const AnalyzeView: React.FC<{lang: Language}> = ({lang}) => {
  const t = UI_STRINGS[lang];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState(''); 
  const [editedImage, setEditedImage] = useState<string | null>(null); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
      const cleanText = analysis.replace(/[*#]/g, '');
      const base64Audio = await generateSpeech(cleanText, 'Zephyr', { lang });
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

  const triggerAnalysis = async (imgData: string, type: string) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage(t.analyzingImage);
    setAnalysis('');
    setError(null);
    
    try {
      const result = await analyzeImageContent(imgData, type, t.imageAnalysisPrompt, {
        lang: lang,
        onProgress: (p, m) => {
          setLoadingProgress(p);
          setLoadingMessage(m);
        },
      });
      setAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(t.imageAnalysisError || "Failed to analyze image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setMimeType(file.type);
        setAnalysis('');
        setEditedImage(null);
        setEditPrompt('');
        setError(null);
        // Automatically start analysis
        triggerAnalysis(result, file.type);
      };
      reader.readAsDataURL(file);
    }
    // Reset inputs so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleEditImage = async () => {
    if (!selectedImage || !editPrompt.trim()) return;

    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage(t.editingImage);
    setEditedImage(null);
    try {
      const result = await editImage(selectedImage, mimeType, editPrompt, {
        lang: lang,
        onProgress: (p, m) => {
          setLoadingProgress(p);
          setLoadingMessage(m);
        },
      });
      setEditedImage(result);
    } catch (error) {
      console.error("Error editing image:", error);
      setError(t.failedToEditImageAlert);
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    stopAudio();
    setSelectedImage(null);
    setMimeType('');
    setAnalysis('');
    setEditPrompt('');
    setEditedImage(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scanner-beam {
          position: absolute;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(to bottom, transparent, #3b82f6, transparent);
          box-shadow: 0 0 15px #3b82f6;
          z-index: 20;
          animation: scan-line 2.5s linear infinite;
        }
      `}</style>

      {/* Hidden Inputs moved outside to prevent re-triggering issues */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileSelect} 
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileSelect} 
      />

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 shadow-inner">
            <Camera size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{t.analyzeEditImages}</h2>
            <p className="text-xl text-slate-500 font-medium">{t.uploadPhotoToUnderstand}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8 animate-fade-in">
            <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-blue-100 aspect-video bg-slate-50 shadow-inner">
               <div className="scanner-beam" />
               {selectedImage && <img src={selectedImage} alt="Scanning" className="w-full h-full object-cover opacity-40 grayscale" />}
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-blue-100 flex items-center gap-3">
                    <Sparkles className="text-blue-500 animate-spin" size={28} />
                    <span className="text-blue-700 font-black uppercase tracking-widest text-sm">{loadingMessage}</span>
                  </div>
               </div>
            </div>
            <LoadingBar progress={loadingProgress} message={loadingMessage} lang={lang} className="!shadow-none !border-0" />
          </div>
        ) : !selectedImage ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="border-4 border-slate-100 rounded-[2.5rem] p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all group flex flex-col items-center gap-4 shadow-sm active:scale-95"
            >
              <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
                <Camera size={56} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800">{t.takePhoto}</h3>
                <p className="text-lg text-slate-500 font-medium">{t.describeImageSimple}</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-slate-100 rounded-[2.5rem] p-12 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-4 shadow-sm active:scale-95"
            >
              <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-inner">
                <ImageIcon size={56} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800">{t.uploadPhoto}</h3>
                <p className="text-lg text-slate-500 font-medium">{t.uploadPhotoForEditOrAnalysis}</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-slate-100 shadow-2xl max-h-[500px] flex justify-center bg-slate-50">
              <img 
                src={selectedImage} 
                alt="Uploaded preview" 
                className="max-h-full object-contain"
              />
              <button 
                onClick={clearImage}
                className="absolute top-6 right-6 bg-white/95 p-4 rounded-full shadow-2xl text-slate-600 hover:text-red-500 transition-all hover:scale-110 active:scale-95 z-30"
                title={t.removeImage}
              >
                <X size={32} />
              </button>
              
              {analysis && (
                <button 
                  onClick={playAnalysisAudio}
                  className="absolute bottom-6 right-6 p-6 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-30 ring-4 ring-white"
                  title={t.readAloud}
                >
                  {isPlayingAudio ? <StopCircle size={36} /> : <Volume2 size={36} />}
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 flex items-center gap-4 text-red-700 animate-fade-in">
                <AlertCircle size={32} className="flex-shrink-0" />
                <p className="text-xl font-black">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              {analysis && (
                <div className="bg-slate-50 p-10 rounded-[3rem] shadow-inner border-2 border-slate-100 animate-fade-in relative">
                  <h3 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Sparkles size={36} className="text-blue-500" />
                    {t.whatIFound}:
                  </h3>
                  <div className="text-slate-800">
                    <Markdown content={analysis} className="!text-2xl" />
                  </div>
                </div>
              )}
              
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border-2 border-slate-100 mt-8">
                <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                  <Wand2 size={32} className="text-indigo-500" />
                  {t.editYourPicture}
                </h3>
                <p className="text-lg text-slate-500 font-medium mb-6">{t.howToEditImage}</p>
                <div className="relative group">
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={t.editImagePlaceholder}
                    className="w-full p-6 text-xl border-4 border-slate-100 rounded-3xl focus:border-indigo-500 focus:outline-none min-h-[140px] resize-none text-slate-800 bg-slate-50 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <Button 
                  onClick={handleEditImage} 
                  fullWidth 
                  disabled={!selectedImage || !editPrompt.trim() || isLoading}
                  className="mt-6 !bg-indigo-600 hover:!bg-indigo-700 !border-indigo-800 !py-6 !text-2xl !rounded-2xl shadow-lg shadow-indigo-100"
                >
                  <Wand2 size={32} />
                  {t.editImageButton}
                </Button>
              </div>

              {editedImage && (
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-indigo-100 animate-fade-in">
                  <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <ImageIcon size={36} className="text-indigo-500" />
                    {t.yourEditedImage}:
                  </h3>
                  <div className="aspect-square w-full bg-slate-100 rounded-[2rem] overflow-hidden mb-8 border-4 border-white shadow-inner flex items-center justify-center">
                     <img 
                       src={editedImage} 
                       alt={`Edited result`} 
                       className="max-h-full object-contain"
                     />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a href={editedImage} download={`doriai-edited.png`} className="w-full">
                      <Button variant="secondary" fullWidth className="!py-6 !text-xl !rounded-2xl">
                        <Download size={28} />
                        {t.saveEditedPicture}
                      </Button>
                    </a>
                    <Button variant="secondary" onClick={() => { setEditedImage(null); setEditPrompt(''); }} className="!py-6 !text-xl !rounded-2xl">
                      <RefreshCcw size={28} />
                      {t.editAgain}
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t-2 border-slate-50 flex justify-center">
                <Button variant="secondary" onClick={clearImage} className="!py-6 !px-12 !text-xl !rounded-2xl shadow-sm">
                  <RefreshCcw size={24} className="mr-2" /> {t.startOverNewPhoto}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
