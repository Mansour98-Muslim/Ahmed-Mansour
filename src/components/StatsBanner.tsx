import React, { useEffect, useRef } from 'react';
import { Flame, CheckCircle2, Clock, Plus, Sparkles } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

interface StatsBannerProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
  grade: {
    label: string;
    sublabel: string;
    color: string;
    badgeBg: string;
    emoji: string;
  };
  streak: number;
  onOpenAddHabit: () => void;
  onOpenTasbeeh: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  completedCount,
  totalCount,
  percentage,
  grade,
  streak,
  onOpenAddHabit,
  onOpenTasbeeh,
}) => {
  const previousRate = useRef(percentage);

  // Trigger confetti celebratory effect when user reaches 90% or above for the first time in session
  useEffect(() => {
    if (percentage >= 90 && previousRate.current < 90) {
      try {
        triggerConfetti();
      } catch {
        // Safe fallback
      }
    }
    previousRate.current = percentage;
  }, [percentage]);

  const strokeDashoffset = 283 - (283 * percentage) / 100;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Progress Ring & Main Percentage */}
        <div className="md:col-span-4 flex items-center gap-4 sm:gap-6 justify-center md:justify-start">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-stone-100"
                strokeWidth="9"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-emerald-700 transition-all duration-500 ease-out"
                strokeWidth="9"
                strokeDasharray="276"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold font-cairo text-stone-900 tabular-nums">
                {percentage}%
              </span>
              <span className="text-[10px] text-stone-500 font-medium">نسبة الإنجاز</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl">{grade.emoji}</span>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-cairo">
                {grade.label}
              </h2>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-xs leading-relaxed font-cairo">
              {grade.sublabel}
            </p>
          </div>
        </div>

        {/* Numeric Metrics */}
        <div className="md:col-span-5 grid grid-cols-3 gap-2 sm:gap-3 py-2 border-y md:border-y-0 md:border-x border-stone-100 px-0 md:px-4">
          <div className="bg-emerald-50/70 rounded-xl p-3 text-center border border-emerald-100">
            <div className="flex items-center justify-center gap-1 text-emerald-800 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] font-semibold">المنجز</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-emerald-950 font-cairo tabular-nums">
              {completedCount}
            </span>
          </div>

          <div className="bg-stone-50 rounded-xl p-3 text-center border border-stone-200">
            <div className="flex items-center justify-center gap-1 text-stone-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[11px] font-semibold">المتبقي</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-stone-800 font-cairo tabular-nums">
              {Math.max(0, Math.round((totalCount - completedCount) * 10) / 10)}
            </span>
          </div>

          <div className="bg-amber-50/70 rounded-xl p-3 text-center border border-amber-200">
            <div className="flex items-center justify-center gap-1 text-amber-800 mb-1">
              <Flame className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] font-semibold">التتابع</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-amber-950 font-cairo tabular-nums">
              {streak} <span className="text-xs font-normal">أيام</span>
            </span>
          </div>
        </div>

        {/* Quick action triggers */}
        <div className="md:col-span-3 flex md:flex-col gap-2 justify-center">
          <button
            onClick={onOpenAddHabit}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-800" />
            <span>إضافة طاعة</span>
          </button>

          <button
            onClick={onOpenTasbeeh}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>المسبحة اليومية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
