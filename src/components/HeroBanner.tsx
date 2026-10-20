import React from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { UserProfile } from '../types';
import { getCombinedDateDisplay } from '../utils/dateUtils';

interface HeroBannerProps {
  profile: UserProfile;
  selectedDate: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
  onOpenReport: () => void;
  onStartAccounting: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  profile,
  selectedDate,
  completedCount,
  totalCount,
  percentage,
  onOpenReport,
  onStartAccounting,
}) => {
  const dates = getCombinedDateDisplay(selectedDate);
  const remainingCount = Math.max(0, Math.round((totalCount - completedCount) * 10) / 10);
  const strokeDashoffset = 251 - (251 * percentage) / 100;

  return (
    <div className="space-y-4">
      {/* 1. Greeting Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        {/* Right Info (RTL) */}
        <div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 block mb-1 font-cairo">
            السلام عليكم ورحمة الله
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-cairo tracking-tight">
            {profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-cairo mt-1 tabular-nums">
            {dates.combined}
          </p>
        </div>

        {/* Left Action Button (RTL) */}
        <button
          onClick={onOpenReport}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-300 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs transition-all active:scale-[0.98] whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>تقرير اليوم</span>
        </button>
      </div>

      {/* 2. Deep Green Central Hero Banner */}
      <div className="bg-[#064e3b] dark:bg-[#033b2c] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-800/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
        {/* Left Side: Start Button */}
        <div className="order-2 md:order-1 w-full md:w-auto">
          <button
            onClick={onStartAccounting}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-stone-900 hover:bg-stone-100 font-bold font-cairo text-sm sm:text-base rounded-2xl shadow-md transition-all active:scale-95"
          >
            <span>ابدأ محاسبة اليوم</span>
            <ArrowLeft className="w-4 h-4 text-stone-900" />
          </button>
        </div>

        {/* Right Side: Message & Circular Progress */}
        <div className="order-1 md:order-2 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right w-full md:w-auto justify-end">
          {/* Text block */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/80 dark:bg-emerald-950/80 text-emerald-200 border border-emerald-700/50 rounded-full text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>المحاسبة اليومية</span>
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-cairo text-white leading-snug">
              «أحب الأعمال إلى الله أدومها وإن قل». استمر وثابر.
            </h3>

            <p className="text-xs sm:text-sm text-emerald-200/90 font-cairo tabular-nums">
              الأعمال المنجزة: <span className="font-bold text-white">{completedCount}</span>
              {' · '}
              المتبقي لليوم: <span className="font-bold text-white">{remainingCount}</span>
            </p>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-900/80"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-400 transition-all duration-500 ease-out"
                strokeWidth="8"
                strokeDasharray="251"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-extrabold font-cairo text-white tabular-nums leading-none">
                {percentage}%
              </span>
              <span className="text-[10px] text-emerald-300 font-medium font-cairo mt-1">
                إنجاز اليوم
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
