import React, { useState, useRef, useEffect } from 'react';
import { generateTextResponse, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import { Message, Language } from '../types';
import { Button } from '../components/Button';
import { Markdown } from '../components/Markdown';
import { BrainCircuit, Send, User, Bot, Sparkles, Terminal, Globe, Volume2, StopCircle, PlusCircle, ArrowRight, MessageSquareText, ExternalLink } from 'lucide-react';
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

  // We removed the automatic useEffect for scrolling to satisfy the request 
  // that AI messages don't force a scroll.

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    setSuggestions(isRTL ? 
      ['איך שולחים הודעה?', 'ספר לי בדיחה', 'איך שומרים תמונה?'] : 
      ['How to message?', 'Tell me a joke', 'Save a photo?']
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
      const prompt = `Provide 3 short follow-up questions for a senior user in ${lang === 'he' ? 'Hebrew' : 'English'}. Max 4 words each. Context: "${context.slice(0, 200)}" Format: q1|q2|q3`;
      const { text } = await generateTextResponse(prompt, false, false);
      if (text) {
        const parts = text.split('|').map(s => s.trim()).filter(s => s.length > 2);
        setSuggestions(parts.slice(0, 3));
      }
    } catch (e) { console.error(e); }
  };

  const handleSend = async (textToSend: string = input) => {
    const trimmedInput = textToSend.trim();
    if (!trimmedInput) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMsg]);
    
    // Explicitly scroll when the user sends a message so they see their own text appear
    setTimeout(() => scrollToBottom('smooth'), 50);

    setInput('');
    setSuggestions([]);
    setIsLoading(true);
    setChatLoadingMessage(t.thinkingDeeply); 
    stopCurrentAudio();
    
    try {
      const { text: responseText, groundingChunks } = await generateTextResponse(trimmedInput, useThinking, useSearchGrounding, {
        lang: lang,
        onProgress: (p, m) => { setChatLoadingProgress(p); setChatLoadingMessage(m); }
      });
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, isThinking: useThinking };
      if (groundingChunks) {
        aiMsg.groundingUrls = groundingChunks.reduce((acc: any[], chunk: any) => {
          if (chunk.web?.uri && !acc.some(item => item.uri === chunk.web.uri)) acc.push({ uri: chunk.web.uri, title: chunk.web.title });
          return acc;
        }, []);
      }
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
      fetchSuggestions(responseText);
      
      // We do NOT call scrollToBottom here, allowing the user to stay 
      // where they are if they were reading previous messages.
    } catch (error) {
      setIsLoading(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: t.aiConnectionIssue }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto bg-white rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden md:border-4 border-slate-100 md:my-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b-2 border-slate-50 p-4 sm:p-6 md:p-8 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="bg-blue-600 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Bot size={28} className="text-white md:hidden" />
            <Bot size={40} className="text-white hidden md:block" />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">{t.chat}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">{t.activeAISystem}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all ${useSearchGrounding ? 'bg-blue-50 border-blue-400 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
            title={t.enableSearchGrounding}
          >
            <Globe size={20} className="md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => setUseThinking(!useThinking)}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all ${useThinking ? 'bg-blue-50 border-blue-400 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
            title={t.enableDeepReasoning}
          >
            <BrainCircuit size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 scroll-smooth bg-slate-50/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[90%] md:max-w-[75%] relative flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-5 py-4 md:px-8 md:py-6 rounded-2xl md:rounded-[2.5rem] shadow-sm text-lg md:text-2xl font-semibold leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100' 
                  : 'bg-white text-slate-800 border-2 border-slate-100 rounded-tl-none shadow-md'
              }`}>
                {msg.isThinking && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4 border-b border-blue-50 pb-2">
                    <Terminal size={14} /> <span>{t.deepReasoningProtocol}</span>
                  </div>
                )}
                <Markdown content={msg.text} className={msg.role === 'user' ? '[&_p]:text-white [&_strong]:text-blue-100' : ''} />
                
                {msg.role === 'model' && (
                  <button
                    onClick={() => playingAudioId === msg.id ? stopCurrentAudio() : playAudio(msg.id, msg.text)}
                    className="mt-4 flex items-center gap-2 text-blue-600 text-xs md:text-sm font-black uppercase tracking-widest hover:bg-blue-50 py-2 px-4 rounded-full transition-all border border-blue-100"
                  >
                    {playingAudioId === msg.id ? (
                      <><span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" /> {t.stopReading}</>
                    ) : (
                      <><Volume2 size={16} /> {t.readAloud}</>
                    )}
                  </button>
                )}
              </div>
              
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 w-full max-w-sm p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 text-[10px] shadow-sm">
                  <p className="font-black text-slate-400 uppercase tracking-widest mb-2">{t.sources}:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, i) => (
                      <a 
                        key={i} href={url.uri} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold border border-blue-100"
                      >
                        <ExternalLink size={12} />
                        <span className="truncate max-w-[120px]">{url.title || url.uri}</span>
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
            <div className="bg-white px-5 py-4 rounded-2xl md:rounded-[2.5rem] rounded-tl-none shadow-md border-2 border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                <span className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest">{chatLoadingMessage}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-4 py-3 flex flex-wrap gap-2 justify-center bg-slate-50/50 border-t border-slate-50">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 font-black text-sm md:text-base rounded-xl border border-blue-100 shadow-sm transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-white border-t border-slate-100 z-10">
        <div className="relative flex items-center gap-2 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-2xl md:rounded-[2.5rem] border-2 border-slate-100 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
          <button className="p-2 text-slate-400 hover:text-blue-500">
            <PlusCircle size={28} className="md:w-8 md:h-8" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.typeMessage}
            className="flex-1 bg-transparent py-2 text-base md:text-xl font-semibold outline-none text-slate-800 placeholder:text-slate-300"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-3 md:p-4 rounded-full transition-all shadow-lg active:scale-90 ${
              !input.trim() || isLoading 
                ? 'bg-slate-200 text-slate-400' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Send size={24} className="md:w-7 md:h-7" />
          </button>
        </div>
        <p className="text-center mt-3 text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">
          {t.showSomething}
        </p>
      </div>
    </div>
  );
};
