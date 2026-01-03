
import React, { useState, useRef, useEffect } from 'react';
import { generateTextResponse, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Message, Language } from '../types';
import { Button } from '../components/Button';
import { Markdown } from '../components/Markdown';
import { BrainCircuit, Send, User, Bot, Sparkles, Terminal, Globe, Volume2, StopCircle, PlusCircle, ArrowRight, MessageSquareText } from 'lucide-react';
import { UI_STRINGS } from '../i18n/translations';

interface ChatViewProps {
  lang: Language;
}

export const ChatView: React.FC<ChatViewProps> = ({ lang }) => {
  const t = UI_STRINGS[lang];
  const isRTL = lang === 'he' || lang === 'ar';
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'model', 
      text: t.chatInitialMessage 
    }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [chatLoadingProgress, setChatLoadingProgress] = useState(0);
  const [chatLoadingMessage, setChatLoadingMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions]);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    // Set initial suggestions
    setSuggestions(isRTL ? 
      ['איך שולחים הודעה בוואטסאפ?', 'ספר לי בדיחה', 'איך שומרים תמונה?'] : 
      ['How to use WhatsApp?', 'Tell me a joke', 'How do I save a photo?']
    );
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isRTL]);

  const stopCurrentAudio = () => {
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
      currentAudioSourceRef.current.disconnect();
      currentAudioSourceRef.current = null;
    }
    setPlayingAudioId(null);
  };

  const playAudio = async (messageId: string, text: string) => {
    if (!audioContextRef.current) return;
    stopCurrentAudio();

    setPlayingAudioId(messageId);
    try {
      const base64Audio = await generateSpeech(text, 'Zephyr', {
        lang: lang,
        onProgress: (p) => setChatLoadingProgress(p)
      });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlayingAudioId(null);
      source.start(0);
      currentAudioSourceRef.current = source;
    } catch (error) {
      console.error("Audio error:", error);
      setPlayingAudioId(null);
    }
  };

  const fetchSuggestions = async (context: string) => {
    try {
      const prompt = `Based on the following AI response, provide 3 short, helpful follow-up questions for a senior user in ${lang === 'he' ? 'Hebrew' : 'English'}. 
      Response context: "${context.slice(0, 300)}"
      Format: Only return the 3 questions separated by "|", no numbers.`;
      const { text } = await generateTextResponse(prompt, false, false);
      if (text) {
        const parts = text.split('|').map(s => s.trim()).filter(s => s.length > 5);
        setSuggestions(parts.slice(0, 3));
      }
    } catch (e) {
      console.error("Failed to fetch suggestions:", e);
    }
  };

  const handleSend = async (textToSend: string = input) => {
    const trimmedInput = textToSend.trim();
    if (!trimmedInput) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSuggestions([]);
    setIsLoading(true);
    setChatLoadingProgress(0);
    setChatLoadingMessage(t.thinkingDeeply);
    stopCurrentAudio();

    try {
      const { text: responseText, groundingChunks } = await generateTextResponse(trimmedInput, useThinking, useSearchGrounding, {
        lang: lang,
        onProgress: (p, m) => {
          setChatLoadingProgress(p);
          setChatLoadingMessage(m);
        }
      });
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText,
        isThinking: useThinking
      };

      if (groundingChunks && groundingChunks.length > 0) {
        aiMsg.groundingUrls = groundingChunks.reduce((acc: any[], chunk: any) => {
          if (chunk.web?.uri && !acc.some(item => item.uri === chunk.web.uri)) {
            acc.push({ uri: chunk.web.uri, title: chunk.web.title });
          }
          return acc;
        }, []);
      }

      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
      fetchSuggestions(responseText);
    } catch (error) {
      setIsLoading(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: t.aiConnectionIssue }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-[#F8FAFC] rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Bot size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.chat}</h2>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{t.activeAISystem}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`p-3 rounded-2xl border-2 transition-all ${useSearchGrounding ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
            title={t.enableSearchGrounding}
          >
            <Globe size={24} />
          </button>
          <button
            onClick={() => setUseThinking(!useThinking)}
            className={`p-3 rounded-2xl border-2 transition-all ${useThinking ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
            title={t.enableDeepReasoning}
          >
            <BrainCircuit size={24} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] relative flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-6 py-5 rounded-[2.2rem] shadow-sm text-lg sm:text-xl font-medium leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.isThinking && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3 border-b border-blue-50 pb-2">
                    <Terminal size={14} /> <span>{t.deepReasoningProtocol}</span>
                  </div>
                )}
                <Markdown content={msg.text} className={msg.role === 'user' ? '[&_p]:text-white [&_strong]:text-blue-100' : ''} />
                
                {msg.role === 'model' && (
                  <button
                    onClick={() => playingAudioId === msg.id ? stopCurrentAudio() : playAudio(msg.id, msg.text)}
                    className="mt-4 flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest hover:bg-blue-50 py-2 px-3 rounded-full transition-colors"
                  >
                    {playingAudioId === msg.id ? (
                      <><span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" /> {t.stopReading}</>
                    ) : (
                      <><Volume2 size={16} /> {t.readAloud}</>
                    )}
                  </button>
                )}
              </div>
              
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 w-full max-w-sm p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 text-xs">
                  <p className="font-black text-slate-400 uppercase tracking-widest mb-2">{t.sources}:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((link, idx) => (
                      <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-blue-600 font-bold hover:border-blue-200 transition-colors truncate max-w-[150px]">
                        {link.title || link.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white p-6 rounded-[2.2rem] rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2.5 h-2.5 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
              <span className="text-sm font-black text-blue-600 tracking-widest uppercase">{chatLoadingMessage}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Bar */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-8 pb-4 flex gap-3 overflow-x-auto no-scrollbar animate-slide-up">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="whitespace-nowrap bg-white px-6 py-3 rounded-2xl border-2 border-slate-100 text-slate-700 font-black text-sm hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 group shadow-sm active:scale-95"
            >
              <PlusCircle size={18} className="text-blue-500 group-hover:rotate-90 transition-transform" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-white p-6 md:p-8 border-t border-slate-100 sticky bottom-0">
        <div className="max-w-3xl mx-auto relative group">
          <div className="bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] flex items-center p-3 transition-all focus-within:border-blue-600 focus-within:bg-white shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.typeMessage}
              className="flex-1 bg-transparent px-5 py-4 text-2xl font-medium outline-none text-slate-800 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading}
              className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200 hover:scale-105 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <Send size={28} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};
