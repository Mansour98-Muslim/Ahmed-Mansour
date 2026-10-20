import React from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Moon } from 'lucide-react';
import {
  getTodayIsoString,
  shiftDate,
  getDayLabel,
  formatGregorianArabic,
  formatHijriArabic,
  getHijriShort,
} from '../utils/dateUtils';
import { DayRecord, HabitItem } from '../types';
import { calculateCompletion } from '../utils/storage';

interface DateNavigatorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  records: Record<string, DayRecord>;
  habits: HabitItem[];
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
  records,
  habits,
}) => {
  const today = getTodayIsoString();

  // Generate 7 days ending at today
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const iso = shiftDate(today, -i);
    const [, , d] = iso.split('-').map(Number);
    const rec = records[iso];
    const comp = rec ? calculateCompletion(habits, rec.values) : null;
    const hijriInfo = getHijriShort(iso);

    days.push({
      iso,
      dayNum: d,
      label: getDayLabel(iso),
      isToday: iso === today,
      rate: comp ? comp.percentage : 0,
      hijriDay: hijriInfo.day,
      hijriMonth: hijriInfo.month,
    });
  }

  const goPrevDay = () => {
    onSelectDate(shiftDate(selectedDate, -1));
  };

  const goNextDay = () => {
    onSelectDate(shiftDate(selectedDate, 1));
  };

  const isCurrentToday = selectedDate === today;
  const currentGregorian = formatGregorianArabic(selectedDate);
  const currentHijri = formatHijriArabic(selectedDate);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 transition-colors">
      {/* 1. Header display: Gregorian date alongside Hijri date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
            {/* Gregorian Date */}
            <span className="font-bold text-stone-900 dark:text-stone-100 font-cairo">
              {currentGregorian}
            </span>

            <span className="text-stone-300 dark:text-stone-600 hidden sm:inline">|</span>

            {/* Hijri Date Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 font-amiri font-bold text-xs sm:text-sm">
              <Moon className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <span>{currentHijri}</span>
            </div>
          </div>
        </div>

        {/* Quick Today jump button if viewing past day */}
        {!isCurrentToday && (
          <button
            onClick={() => onSelectDate(today)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors self-start sm:self-auto shrink-0 min-h-[32px]"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>الرجوع إلى تاريخ اليوم</span>
          </button>
        )}
      </div>

      {/* 2. Days Tabs Strip with Previous & Next controls */}
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Next Day (in RTL next is visually forward) */}
        <button
          onClick={goNextDay}
          disabled={isCurrentToday}
          className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="اليوم التالي"
          aria-label="اليوم التالي"
        >
          <ChevronRight className="w-5 h-5 rotate-180 rtl:rotate-0" />
        </button>

        {/* Days Tabs Strip */}
        <div className="flex-1 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none">
          {days.map((item) => {
            const isSelected = item.iso === selectedDate;
            return (
              <button
                key={item.iso}
                onClick={() => onSelectDate(item.iso)}
                className={`flex flex-col items-center justify-center min-w-[58px] sm:min-w-[70px] py-2 px-1.5 sm:px-2 rounded-xl text-center transition-all min-h-[58px] relative ${
                  isSelected
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-800/30'
                    : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80'
                }`}
              >
                {/* Day label (اليوم / السبت ...) */}
                <span className={`text-[10px] sm:text-[11px] font-medium leading-none ${isSelected ? 'text-amber-300 font-bold' : 'text-stone-500 dark:text-stone-400'}`}>
                  {item.label}
                </span>

                {/* Gregorian Day Number */}
                <span className="text-base sm:text-lg font-bold font-cairo leading-tight mt-0.5 tabular-nums">
                  {item.dayNum}
                </span>

                {/* Hijri Day Subtitle */}
                <span
                  className={`text-[9px] sm:text-[10px] font-amiri leading-tight mt-0.5 tabular-nums ${
                    isSelected ? 'text-emerald-100' : 'text-emerald-800 dark:text-emerald-400 font-medium'
                  }`}
                  title={`التاريخ الهجري: ${item.hijriDay} ${item.hijriMonth}`}
                >
                  {item.hijriDay} {item.hijriMonth}
                </span>

                {/* Progress micro badge */}
                {item.rate > 0 && (
                  <span
                    className={`text-[9px] font-bold mt-0.5 tabular-nums px-1 py-0.2 rounded ${
                      isSelected
                        ? 'bg-emerald-900/60 text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {item.rate}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Previous Day */}
        <button
          onClick={goPrevDay}
          className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="اليوم السابق"
          aria-label="اليوم السابق"
        >
          <ChevronLeft className="w-5 h-5 rotate-180 rtl:rotate-0" />
        </button>
      </div>
    </div>
  );
};
