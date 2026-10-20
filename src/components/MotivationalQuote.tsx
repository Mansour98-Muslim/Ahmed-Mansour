import React, { useState } from 'react';
import { Quote as QuoteIcon, RefreshCw } from 'lucide-react';
import { ISLAMIC_QUOTES } from '../data/quotes';

export const MotivationalQuote: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
  };

  const current = ISLAMIC_QUOTES[quoteIndex];

  return (
    <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-800 relative overflow-hidden">
      {/* Decorative background Islamic arabesque pattern in SVG */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-5 pointer-events-none text-white">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
        </svg>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-amber-400">
          <QuoteIcon className="w-5 h-5 shrink-0 opacity-80" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 font-cairo">
            قبس من التذكرة والمحاسبة
          </span>
        </div>

        <button
          onClick={nextQuote}
          className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition-colors"
          title="تغيير القول المأثور"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <blockquote className="mt-3 text-sm sm:text-base md:text-lg font-amiri leading-relaxed text-stone-100 font-medium">
        «{current.text}»
      </blockquote>

      <div className="mt-2.5 flex items-center justify-between text-xs text-stone-400 font-cairo">
        <span className="text-amber-400/90 font-medium">— {current.source}</span>
        <span className="text-stone-500 hidden sm:inline">{current.topic}</span>
      </div>
    </div>
  );
};
