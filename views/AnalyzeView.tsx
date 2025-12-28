import React, { useState, useRef } from 'react';
import { analyzeImageContent } from '../services/geminiService';
import { Button } from '../components/Button';
import { Markdown } from '../components/Markdown';
import { Camera, Upload, Search, X } from 'lucide-react';

export const AnalyzeView: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMimeType(file.type);
        setAnalysis(''); // Clear previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const result = await analyzeImageContent(selectedImage, mimeType, "Explain what is in this image simply and clearly for me. Use bold text for emphasis and bullet points for lists.");
      setAnalysis(result);
    } catch (error) {
      setAnalysis("I'm having trouble seeing this image clearly. Could you try another one?");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysis('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shadow-inner">
            <Camera size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">Explain an Image</h2>
            <p className="text-xl text-slate-500 font-medium">Upload a photo, and I will tell you exactly what I see.</p>
          </div>
        </div>

        {!selectedImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-slate-200 rounded-[2rem] p-16 text-center cursor-pointer hover:bg-slate-50 hover:border-orange-300 transition-all group shadow-inner"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Upload size={40} className="text-orange-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-700 mb-3">Tap to upload a photo</h3>
            <p className="text-xl text-slate-500 max-w-md mx-auto leading-relaxed">I can read menus, identify plants, or describe family photos in detail.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative rounded-[2rem] overflow-hidden border-4 border-slate-100 bg-slate-50 max-h-[500px] flex justify-center shadow-xl">
              <img 
                src={selectedImage} 
                alt="Uploaded preview" 
                className="max-h-full object-contain"
              />
              <button 
                onClick={clearImage}
                className="absolute top-6 right-6 bg-white/95 p-3 rounded-full shadow-2xl text-slate-600 hover:text-red-500 transition-all hover:scale-110 active:scale-95"
                title="Remove image"
              >
                <X size={28} />
              </button>
            </div>

            {!analysis && (
              <Button 
                onClick={handleAnalyze} 
                fullWidth 
                isLoading={isLoading}
                className="!bg-orange-500 hover:!bg-orange-600 !border-orange-700 !py-6 !text-2xl !rounded-[1.5rem]"
              >
                <Search size={32} />
                Analyze This Photo
              </Button>
            )}
          </div>
        )}
      </div>

      {analysis && (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-l-[12px] border-orange-500 animate-fade-in ring-1 ring-slate-100">
          <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <Search size={36} className="text-orange-500" />
            What I found:
          </h3>
          
          <Markdown content={analysis} />

          <div className="mt-12 pt-8 border-t-2 border-slate-50 flex gap-4">
            <Button variant="secondary" onClick={clearImage} fullWidth className="!py-5 !text-xl !rounded-2xl">
              Analyze Another Photo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};