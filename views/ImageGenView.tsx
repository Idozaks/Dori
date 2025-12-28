
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageSize } from '../types';
import { Button } from '../components/Button';
import { Image as ImageIcon, Download, RefreshCw, Wand2, Key, AlertCircle } from 'lucide-react';

/* Removed conflicting Window declaration. Using type assertion for aistudio helper methods as per environment expectations. */

export const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  // Check key selection status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      // Use type assertion to access pre-configured aistudio object
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
      // Assume success after opening dialog as per guidelines to avoid race condition
      setHasKey(true);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imgData = await generateImage(prompt, size);
      setGeneratedImage(imgData);
    } catch (err: any) {
      if (err.message === "API_KEY_REQUIRED") {
        setHasKey(false);
        setError("A paid API key is required for high-quality image generation.");
      } else {
        setError(err.message || "We couldn't create that image. Please try a different description.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mandatory UI for key selection if no key is selected for gemini-3-pro-image-preview
  if (hasKey === false) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-slate-100 text-center">
          <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-inner">
            <Key size={56} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-6">API Key Required</h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Generating high-quality pictures requires you to select your own API key from a paid Google Cloud project.
          </p>
          <div className="bg-amber-50 p-6 rounded-2xl mb-10 border border-amber-100 text-left">
            <div className="flex gap-4 items-start">
              <AlertCircle className="text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-amber-900 font-bold mb-1">Billing must be enabled</p>
                <p className="text-amber-800">
                  Please visit the billing documentation at{' '}
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
          <Button 
            fullWidth 
            onClick={handleOpenKeyDialog} 
            className="!py-6 !text-2xl !rounded-3xl !bg-indigo-600 hover:!bg-indigo-700 shadow-xl shadow-indigo-200"
          >
            Select My API Key
          </Button>
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
              <h2 className="text-2xl font-bold text-slate-800">Create Pictures</h2>
              <p className="text-slate-500">Describe what you want to see, and I'll paint it for you.</p>
            </div>
          </div>
          <button 
            onClick={handleOpenKeyDialog}
            className="flex items-center gap-2 text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <Key size={16} /> Key Settings
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-lg">
              What should I draw?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A happy golden retriever playing in a field of sunflowers"
              className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none min-h-[100px] resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-lg">
              Image Quality (Size)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-lg transition-all ${
                    size === s
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || isLoading} 
            fullWidth
            className="mt-4 !bg-indigo-600 hover:!bg-indigo-700 !border-indigo-800 !py-6 !text-2xl !rounded-2xl shadow-lg shadow-indigo-100"
          >
            {isLoading ? 'Painting...' : 'Create Picture'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border-2 border-red-100 text-lg flex items-center gap-4">
          <AlertCircle className="flex-shrink-0" size={24} />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {generatedImage && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Here is your picture:</h3>
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
              download={`silversurfer-${Date.now()}.png`}
              className="flex-1"
            >
              <Button variant="secondary" fullWidth className="!py-4 !text-xl !rounded-xl">
                <Download size={24} />
                Save to Computer
              </Button>
            </a>
            <Button variant="secondary" onClick={() => setGeneratedImage(null)} className="!py-4 !text-xl !rounded-xl">
              <RefreshCw size={24} />
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
