import React, { useState } from 'react';
import { PenLine, Target, HeartHandshake, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { DUAS } from '../data/quotes';

interface ReflectionSectionProps {
  notes: string;
  tomorrowIntention: string;
  onChangeNotes: (notes: string) => void;
  onChangeTomorrowIntention: (intention: string) => void;
}

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({
  notes,
  tomorrowIntention,
  onChangeNotes,
  onChangeTomorrowIntention,
}) => {
  const [showDuas, setShowDuas] = useState(false);
  const [copiedDuaIndex, setCopiedDuaIndex] = useState<number | null>(null);

  const handleCopyDua = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedDuaIndex(index);
    setTimeout(() => setCopiedDuaIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Self-Reflection & Tomorrow's Intention Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reflection Note */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
            <PenLine className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h3 className="text-sm font-bold font-cairo">
              وقفة مع النفس ومحاسبة اليوم
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo">
            ما النعم التي منّ الله بها عليك لتشكره؟ وما الزلات أو التقصير لتستغفر منه؟
          </p>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="اكتب هنا خواطرك الإيمانية، ما شكرت الله عليه، وما عاهدت الله على تركه..."
            className="w-full p-3 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo resize-none leading-relaxed text-stone-800 dark:text-stone-100"
          />
        </div>

        {/* Tomorrow's Intention */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
            <Target className="w-4 h-4 text-teal-800 dark:text-teal-400" />
            <h3 className="text-sm font-bold font-cairo">
              عقد النية واستدراك الغد بإذن الله
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo">
            حدد عملاً صالحاً تنوي المبادرة إليه غداً بنية خالصة لوجه الله تعالى.
          </p>
          <textarea
            rows={3}
            value={tomorrowIntention}
            onChange={(e) => onChangeTomorrowIntention(e.target.value)}
            placeholder="مثال: غداً أنوي صيام الإثنين/الخميس، أو زيارة قريب، أو ختم جزء..."
            className="w-full p-3 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo resize-none leading-relaxed text-stone-800 dark:text-stone-100"
          />
        </div>
      </div>

      {/* Repentance & Steadfastness Duas Box */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-colors">
        <button
          onClick={() => setShowDuas(!showDuas)}
          className="w-full flex items-center justify-between p-4 text-right hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-cairo">
                أدعية التوبة والاستدراك وحسن الخاتمة
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo mt-0.5">
                سيد الاستغفار، دعاء الثبات على الطاعة، وكفارة المجلس
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-stone-400">
            {showDuas ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showDuas && (
          <div className="p-4 pt-0 border-t border-stone-100 dark:border-stone-800 space-y-3 bg-stone-50/50 dark:bg-stone-800/40">
            {DUAS.map((dua, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700/80 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-400 font-cairo">
                    {dua.title}
                  </span>
                  <button
                    onClick={() => handleCopyDua(dua.text, idx)}
                    className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    {copiedDuaIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-amiri text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-relaxed font-medium">
                  «{dua.text}»
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-cairo">
                  {dua.reward}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
