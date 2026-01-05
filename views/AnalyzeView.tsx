
import React, { useState, useRef } from 'react';
import { analyzeImageContent, editImage } from '../services/geminiService'; // Import editImage
import { Button } from '../components/Button';
import { Markdown } from '../components/Markdown';
import { Camera, Upload, Search, X, Wand2, Image as ImageIcon, Download, RefreshCcw } from 'lucide-react';
import { LoadingBar } from '../components/LoadingBar'; // Import new dynamic LoadingBar
import { Language } from '../types'; // Import Language
import { UI_STRINGS } from '../i18n/translations'; // Import UI_STRINGS

export const AnalyzeView: React.FC<{lang: Language}> = ({lang}) => {
  const t = UI_STRINGS[lang];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState(''); 
  const [editedImage, setEditedImage] = useState<string | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New states for dynamic loading bar
  const [analyzeIsLoadingState, setAnalyzeIsLoadingState] = useState(false);
  const [analyzeLoadingProgress, setAnalyzeLoadingProgress] = useState(0);
  const [analyzeLoadingMessage, setAnalyzeLoadingMessage] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMimeType(file.type);
        setAnalysis(''); // Clear previous analysis
        setEditedImage(null); // Clear previous edited image
        setEditPrompt(''); // Clear previous edit prompt
        setAnalyzeIsLoadingState(false); // Ensure loading is off
        setAnalyzeLoadingProgress(0);
        setAnalyzeLoadingMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalyzeIsLoadingState(true);
    setAnalyzeLoadingProgress(0);
    setAnalyzeLoadingMessage(t.analyzingImage);
    setAnalysis(''); // Clear previous analysis before new one
    try {
      const result = await analyzeImageContent(selectedImage, mimeType, t.imageAnalysisPrompt, {
        lang: lang,
        onProgress: (progress: number, message: string) => {
          setAnalyzeLoadingProgress(progress);
          setAnalyzeLoadingMessage(message);
        },
        onComplete: () => setAnalyzeIsLoadingState(false),
        onError: () => setAnalyzeIsLoadingState(false)
      });
      setAnalysis(result);
    } catch (error) {
      setAnalysis(t.imageAnalysisError);
      setAnalyzeIsLoadingState(false);
    }
  };

  const handleEditImage = async () => {
    if (!selectedImage || !editPrompt.trim()) return;

    setAnalyzeIsLoadingState(true);
    setAnalyzeLoadingProgress(0);
    setAnalyzeLoadingMessage(t.editingImage);
    setEditedImage(null); // Clear previous edited image
    try {
      const result = await editImage(selectedImage, mimeType, editPrompt, {
        lang: lang,
        onProgress: (progress: number, message: string) => {
          setAnalyzeLoadingProgress(progress);
          setAnalyzeLoadingMessage(message);
        },
        onComplete: () => setAnalyzeIsLoadingState(false),
        onError: () => setAnalyzeIsLoadingState(false)
      });
      setEditedImage(result);
    } catch (error) {
      console.error("Error editing image:", error);
      setEditedImage(null);
      alert(t.failedToEditImageAlert);
      setAnalyzeIsLoadingState(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setMimeType('');
    setAnalysis('');
    setEditPrompt('');
    setEditedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setAnalyzeIsLoadingState(false); // Ensure loading is off
    setAnalyzeLoadingProgress(0);
    setAnalyzeLoadingMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shadow-inner">
            <Camera size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{t.analyzeEditImages}</h2>
            <p className="text-xl text-slate-500 font-medium">{t.uploadPhotoToUnderstand}</p>
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
            <h3 className="text-2xl font-black text-slate-700 mb-3">{t.tapToUploadPhoto}</h3>
            <p className="text-xl text-slate-500 max-w-md mx-auto leading-relaxed">{t.uploadPhotoForEditOrAnalysis}</p>
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
                title={t.removeImage}
              >
                <X size={28} />
              </button>
            </div>

            {analyzeIsLoadingState ? (
              <LoadingBar progress={analyzeLoadingProgress} message={analyzeLoadingMessage} lang={lang} />
            ) : (
              <>
                {/* Analysis Section */}
                {!analysis && (
                  <Button 
                    onClick={handleAnalyze} 
                    fullWidth 
                    className="!bg-orange-500 hover:!bg-orange-600 !border-orange-700 !py-6 !text-2xl !rounded-[1.5rem]"
                  >
                    <Search size={32} />
                    {t.analyzeThisPhoto}
                  </Button>
                )}

                {analysis && (
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-l-[12px] border-orange-500 animate-fade-in ring-1 ring-slate-100">
                    <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <Search size={36} className="text-orange-500" />
                      {t.whatIFound}:
                    </h3>
                    <div className="text-slate-800">
                      <Markdown content={analysis} />
                    </div>
                    <div className="mt-12 pt-8 border-t-2 border-slate-100 flex gap-4">
                      <Button variant="secondary" onClick={() => setAnalysis('')} fullWidth className="!py-5 !text-xl !rounded-2xl !text-slate-700">
                        {t.clearAnalysis}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Image Editing Section */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 mt-8">
                  <h3 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Wand2 size={36} className="text-indigo-500" />
                    {t.editYourPicture}
                  </h3>
                  <p className="text-xl text-slate-500 font-medium mb-6">{t.howToEditImage}</p>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={t.editImagePlaceholder}
                    className="w-full p-5 text-xl border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none min-h-[120px] resize-none text-slate-800"
                  />
                  <Button 
                    onClick={handleEditImage} 
                    fullWidth 
                    disabled={!selectedImage || !editPrompt.trim()}
                    className="mt-6 !bg-indigo-600 hover:!bg-indigo-700 !border-indigo-800 !py-6 !text-2xl !rounded-2xl shadow-lg shadow-indigo-100"
                  >
                    <Wand2 size={32} />
                    {t.editImageButton}
                  </Button>
                </div>

                {editedImage && (
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-l-[12px] border-indigo-500 animate-fade-in ring-1 ring-slate-100">
                    <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <ImageIcon size={36} className="text-indigo-500" />
                      {t.yourEditedImage}:
                    </h3>
                    
                    <div className="aspect-square w-full bg-slate-100 rounded-xl overflow-hidden mb-8 border-2 border-slate-100 shadow-inner flex items-center justify-center">
                       <img 
                         src={editedImage} 
                         alt={`Edited image: ${editPrompt}`} 
                         className="max-h-full object-contain"
                       />
                    </div>
                    <div className="flex gap-4">
                      <a 
                        href={editedImage} 
                        download={`doriai-edited-image-${Date.now()}.png`}
                        className="flex-1"
                      >
                        <Button variant="secondary" fullWidth className="!py-5 !text-xl !rounded-2xl !text-slate-700">
                          <Download size={24} />
                          {t.saveEditedPicture}
                        </Button>
                      </a>
                      <Button variant="secondary" onClick={() => { setEditedImage(null); setEditPrompt(''); }} className="!py-5 !text-xl !rounded-2xl !text-slate-700">
                        <RefreshCcw size={24} />
                        {t.editAgain}
                      </Button>
                    </div>
                  </div>
                )}
                {/* Clear all button */}
                {(analysis || editedImage) && (
                  <div className="mt-8 pt-8 border-t-2 border-slate-50 flex justify-center">
                    <Button variant="secondary" onClick={clearImage} className="!py-5 !text-xl !rounded-2xl !text-slate-700">
                      {t.startOverNewPhoto}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
