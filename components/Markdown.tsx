
import React, { useRef, useEffect } from 'react';

const LaTeX: React.FC<{ text: string }> = ({ text }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).katex) {
      try {
        (window as any).katex.render(text, containerRef.current, {
          throwOnError: false,
          displayMode: false
        });
      } catch (e) {
        containerRef.current.textContent = text;
      }
    }
  }, [text]);

  return <span ref={containerRef} />;
};

export const Markdown: React.FC<{ content: string; className?: string }> = ({ content, className = "" }) => {
  if (!content) return null;

  const lines = content.split('\n');

  const renderInline = (text: string) => {
    // Regex for inline math ($...$) and bold (**...**)
    const parts = text.split(/(\$[^\$]+\$|\*\*[^\*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return <LaTeX key={i} text={part.slice(1, -1)} />;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-blue-700">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Headers
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-2xl font-black pt-4 pb-1 border-b-2 border-slate-100 text-slate-900">{renderInline(trimmed.slice(4))}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-3xl font-black pt-6 pb-2 border-b-4 border-slate-100 text-slate-900">{renderInline(trimmed.slice(3))}</h2>;
        }

        // Bullet points
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex items-start gap-4 pl-4 group">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
              <div className="flex-1 text-xl leading-relaxed text-slate-800 font-medium">{renderInline(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={i} className="text-xl leading-relaxed font-medium text-slate-800">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};
