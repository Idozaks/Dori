import React, { useState, useRef, useEffect } from 'react';
import { generateTextResponse } from '../services/geminiService';
import { Message } from '../types';
import { Button } from '../components/Button';
import { Markdown } from '../components/Markdown';
import { BrainCircuit, Send, User, Bot, AlertCircle, Sparkles, Terminal } from 'lucide-react';

export const ChatView: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'model', 
      text: 'Hello! I am your exceptional AI assistant. I can help with general questions, complex math like **$E=mc^2$**, or technical problems. How can I assist you today?' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateTextResponse(userMsg.text, useThinking);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText,
        isThinking: useThinking
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'I encountered an issue connecting to my core processing systems. Please attempt your query again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 flex justify-between items-center shadow-lg relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-400/30 backdrop-blur-md">
            <Bot size={28} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Exceptional Assistant
              <Sparkles size={16} className="text-blue-400 animate-pulse" />
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Intelligent System</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setUseThinking(!useThinking)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 transition-all duration-300 font-black text-sm group ${
            useThinking 
              ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
          }`}
          title="Enable deep reasoning for complex queries"
        >
          <BrainCircuit size={18} className={useThinking ? 'animate-spin-slow' : 'group-hover:rotate-12'} />
          <span className="hidden sm:inline">DEEP REASONING {useThinking ? 'ENABLED' : 'DISABLED'}</span>
          <span className="sm:hidden">{useThinking ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 bg-slate-50/50 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl border-2 transition-transform hover:scale-110 ${
              msg.role === 'user' 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-white border-slate-200 text-slate-700'
            }`}>
              {msg.role === 'user' ? <User size={28} /> : <Bot size={28} />}
            </div>
            
            <div className={`max-w-[85%] group relative ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-6 rounded-[2rem] shadow-xl transition-all ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none text-xl font-medium' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.isThinking && (
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4 border-b border-blue-50 pb-2">
                    <Terminal size={14} />
                    <span>Deep Reasoning Protocol Applied</span>
                  </div>
                )}
                <Markdown content={msg.text} className={msg.role === 'user' ? '[&_p]:text-white [&_strong]:text-white' : ''} />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3 ${msg.role === 'user' ? 'mr-4' : 'ml-4'}`}>
                {msg.role === 'user' ? 'User Identity' : 'AI Core'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-5 animate-pulse">
             <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 text-slate-300 flex items-center justify-center flex-shrink-0 shadow-sm">
               <Bot size={28} />
             </div>
             <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  <span className="w-2.5 h-2.5 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                </div>
                {useThinking && (
                  <span className="text-sm font-black text-blue-600 ml-2 tracking-widest uppercase">
                    Synthesizing Complex Response...
                  </span>
                )}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Area */}
      <div className="bg-white p-6 md:p-8 border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-slate-100/80 p-2 rounded-[2.5rem] border-2 border-slate-200/50 focus-within:border-blue-500 focus-within:bg-white transition-all duration-300 shadow-inner group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Query the intelligent core..."
              className="flex-1 bg-transparent p-5 text-2xl font-medium text-slate-800 outline-none placeholder:text-slate-400"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading} 
              className="!rounded-full !w-16 !h-16 !p-0 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-90 transition-all"
            >
              <Send size={26} className={isLoading ? 'animate-ping' : ''} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};