
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageSize, Language } from '../types';
import { Button } from '../components/Button';
import { Image as ImageIcon, Download, RefreshCw, Wand2, Key, AlertCircle, Check } from 'lucide-react';
import { LoadingBar } from '../components/LoadingBar';
import { UI_STRINGS } from '../i18n/translations';

export const ImageGenView: React.FC<{lang: Language}> = ({lang}) => {
  const t = UI_STRINGS[lang];
  const [prompt, setPrompt] = useState('');
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [size, setSize] = useState<ImageSize>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageIsLoadingState, setImageIsLoadingState] = useState(false);
  const [imageLoadingProgress, setImageLoadingProgress] = useState(0);
  const [imageLoadingMessage, setImageLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // If high quality is requested, check for key first
    if (isHighQuality && !hasKey) {
      setError(t.apiKeyRequiredImageGen);
      return;
    }

    setImageIsLoadingState(true);
    setImageLoadingProgress(0);
    setImageLoadingMessage(t.generatingImage);
    setError(null);
    setGeneratedImage(null);

    try {
      const imgData = await generateImage(prompt, isHighQuality, size, {
        lang: lang,
        onProgress: (progress: number, message: string) => {
          setImageLoadingProgress(progress);
          setImageLoadingMessage(message);
        },
        onComplete: () => setImageIsLoadingState(false),
        onError: () => setImageIsLoadingState(false)
      });
      setGeneratedImage(imgData);
    } catch (err: any) {
      setImageIsLoadingState(false);
      if (err.message === "API_KEY_REQUIRED") {
        setHasKey(false);
        setError(t.apiKeyRequiredImageGen);
      } else {
        setError(err.message || t.failedToCreateImage);
      }
    }
  };

  // Only show full screen key required if high quality is explicitly toggled and no key is found
  if (isHighQuality && hasKey === false) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-slate-100 text-center">
          <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-inner">
            <Key size={56} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-6">{t.apiKeyRequired}</h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            {t.apiKeyRequiredImageGen}
          </p>
          <div className="bg-amber-50 p-6 rounded-2xl mb-10 border border-amber-100 text-left">
            <div className="flex gap-4 items-start">
              <AlertCircle className="text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-amber-900 font-bold mb-1">{t.billingMustBeEnabled}</p>
                <p className="text-amber-800">
                  {t.visitBillingDocs}{' '}
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-black"
                  >
                    ai.google.dev/gemini-api/docs/billing
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button 
              fullWidth 
              onClick={handleOpenKeyDialog} 
              className="!py-6 !text-2xl !rounded-3xl !bg-indigo-600 hover:!bg-indigo-700 shadow-xl shadow-indigo-200"
            >
              {t.selectMyApiKey}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setIsHighQuality(false)} 
              className="!py-6 !text-2xl !rounded-3xl shadow-xl"
            >
              {t.back}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Wand2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t.createPictures}</h2>
              <p className="text-slate-500">{t.describeAndAIWillPaint}</p>
            </div>
          </div>
          {hasKey && (
            <button 
              onClick={handleOpenKeyDialog}
              className="flex items-center gap-2 text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Key size={16} /> {t.keySettings}
            </button>
          )}
        </div>

        {!imageIsLoadingState ? (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-lg">
                {t.whatShouldIDraw}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.imageGenPlaceholder}
                className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none min-h-[100px] resize-none"
              />
            </div>

            <div className="flex items-center gap-4 py-2 border-y border-slate-50">
              <button
                onClick={() => setIsHighQuality(!isHighQuality)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all font-black ${
                  isHighQuality 
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg' 
                    : 'bg-white text-slate-600 border-slate-100'
                }`}
              >
                {isHighQuality && <Check size={20} />}
                {isHighQuality ? 'High Quality Mode ON' : 'Standard Quality (Faster)'}
              </button>
              {isHighQuality && (
                <div className="flex-1 flex gap-2">
                  {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex-1 py-3 rounded-xl border-2 font-black transition-all ${
                        size === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!prompt.trim()}
              fullWidth
              className="mt-4 !bg-indigo-600 hover:!bg-indigo-700 !border-indigo-800 !py-6 !text-2xl !rounded-2xl shadow-lg shadow-indigo-100"
            >
              <Wand2 size={32} /> {t.createPicture}
            </Button>
          </div>
        ) : (
          <LoadingBar progress={imageLoadingProgress} message={imageLoadingMessage} lang={lang} />
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border-2 border-red-100 text-lg flex items-center gap-4">
          <AlertCircle className="flex-shrink-0" size={24} />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {generatedImage && !imageIsLoadingState && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{t.yourPicture}:</h3>
          <div className="aspect-square w-full bg-slate-100 rounded-xl overflow-hidden mb-4 border-2 border-slate-100">
             <img 
               src={generatedImage} 
               alt={prompt} 
               className="w-full h-full object-contain"
             />
          </div>
          <div className="flex gap-4">
            <a 
              href={generatedImage} 
              download={`doriai-generated-${Date.now()}.png`}
              className="flex-1"
            >
              <Button variant="secondary" fullWidth className="!py-4 !text-xl !rounded-xl">
                <Download size={24} />
                {t.saveToComputer}
              </Button>
            </a>
            <Button variant="secondary" onClick={() => setGeneratedImage(null)} className="!py-4 !text-xl !rounded-xl">
              <RefreshCw size={24} />
              {t.clear}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
