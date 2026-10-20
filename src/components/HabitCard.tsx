import React, { useState } from 'react';
import { Check, Plus, Minus, Trash2, Info, BookOpen } from 'lucide-react';
import { HabitItem } from '../types';
import { speakArabicPhrase } from '../utils/audio';

interface HabitCardProps {
  habit: HabitItem;
  value: boolean | number | undefined;
  onChange: (habitId: string, newValue: boolean | number) => void;
  onDeleteCustom?: (habitId: string) => void;
  onOpenTasbeehWithHabit?: (habit: HabitItem) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  value,
  onChange,
  onDeleteCustom,
  onOpenTasbeehWithHabit,
}) => {
  const [showReward, setShowReward] = useState(false);

  const isBoolean = habit.type === 'boolean';
  const isChecked = isBoolean && Boolean(value);

  const currentCount = !isBoolean && typeof value === 'number' ? value : 0;
  const targetCount = habit.targetCount || 100;
  const isCounterDone = !isBoolean && currentCount >= targetCount;

  const toggleBoolean = () => {
    const nextVal = !isChecked;
    onChange(habit.id, nextVal);
    if (nextVal) {
      if (habit.category === 'morals' || (habit.category as string) === 'charity') {
        speakArabicPhrase('جزاك الله خيراً ونفع بك');
      } else {
        speakArabicPhrase('الحمد لله');
      }
    }
  };

  const increment = (delta: number) => {
    const next = Math.max(0, currentCount + delta);
    onChange(habit.id, next);
    if (next >= targetCount && currentCount < targetCount) {
      if (habit.category === 'morals' || (habit.category as string) === 'charity') {
        speakArabicPhrase('جزاك الله خيراً ونفع بك');
      } else {
        speakArabicPhrase('الحمد لله');
      }
    }
  };

  const handleCountDirectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    const next = isNaN(parsed) ? 0 : Math.max(0, parsed);
    onChange(habit.id, next);
    if (next >= targetCount && currentCount < targetCount) {
      if (habit.category === 'morals' || (habit.category as string) === 'charity') {
        speakArabicPhrase('جزاك الله خيراً ونفع بك');
      } else {
        speakArabicPhrase('الحمد لله');
      }
    }
  };

  return (
    <div
      className={`rounded-xl p-3.5 sm:p-4 border transition-all duration-200 ${
        (isChecked || isCounterDone)
          ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60 shadow-xs'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-2xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox / Action Trigger on right (in RTL) */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {isBoolean ? (
            <button
              type="button"
              onClick={toggleBoolean}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors min-h-[44px] min-w-[44px] ${
                isChecked
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 text-transparent'
              }`}
              aria-label={isChecked ? 'إلغاء التحديد' : 'تحديد كمنجز'}
            >
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center ${
                  isChecked
                    ? 'bg-emerald-800 text-white'
                    : 'border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />}
              </div>
            </button>
          ) : (
            <div className="flex items-center justify-center min-h-[44px] min-w-[44px] shrink-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-cairo ${
                  isCounterDone
                    ? 'bg-emerald-800 text-white'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
              >
                {isCounterDone ? <Check className="w-4 h-4 stroke-[3]" /> : 'ع'}
              </div>
            </div>
          )}

          {/* Title and details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                onClick={isBoolean ? toggleBoolean : undefined}
                className={`text-sm sm:text-base font-semibold leading-snug cursor-pointer font-cairo ${
                  isChecked || isCounterDone
                    ? 'text-emerald-950 dark:text-emerald-300 font-bold'
                    : 'text-stone-900 dark:text-stone-100'
                }`}
              >
                {habit.title}
              </h3>

              {habit.isCustom && (
                <span className="text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  مخصص
                </span>
              )}
            </div>

            {habit.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed line-clamp-2 font-cairo">
                {habit.description}
              </p>
            )}

            {/* Counter bar & Stepper */}
            {!isBoolean && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-800 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => increment(-1)}
                    disabled={currentCount <= 0}
                    className="p-1.5 px-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                    title="إنقاص 1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={currentCount}
                    onChange={handleCountDirectChange}
                    className="w-14 text-center text-xs sm:text-sm font-bold font-cairo tabular-nums focus:outline-none py-1 text-stone-900 dark:text-stone-100 bg-transparent"
                  />

                  <button
                    type="button"
                    onClick={() => increment(1)}
                    className="p-1.5 px-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                    title="زيادة 1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick batch buttons */}
                <button
                  type="button"
                  onClick={() => increment(10)}
                  className="px-2 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition-colors tabular-nums min-h-[36px]"
                >
                  +10
                </button>

                {targetCount > 50 && (
                  <button
                    type="button"
                    onClick={() => increment(33)}
                    className="px-2 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition-colors tabular-nums min-h-[36px]"
                  >
                    +33
                  </button>
                )}

                {/* Direct complete button */}
                {currentCount < targetCount && (
                  <button
                    type="button"
                    onClick={() => onChange(habit.id, targetCount)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap min-h-[36px]"
                  >
                    إتمام الهدف ({targetCount})
                  </button>
                )}

                {onOpenTasbeehWithHabit && (
                  <button
                    type="button"
                    onClick={() => onOpenTasbeehWithHabit(habit)}
                    className="px-2 py-1 text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-md border border-teal-200 dark:border-teal-800 transition-colors whitespace-nowrap min-h-[36px]"
                    title="فتح في المسبحة الإلكترونية"
                  >
                    فتح بالمسبحة
                  </button>
                )}

                <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium font-cairo tabular-nums mr-auto">
                  الهدف: {targetCount} {habit.unit || 'مرة'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Actions (Reward trigger / Delete custom) */}
        <div className="flex items-center gap-1 shrink-0">
          {habit.reward && (
            <button
              type="button"
              onClick={() => setShowReward(!showReward)}
              className={`p-1.5 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                showReward ? 'bg-amber-100 text-amber-900' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title="فضل هذا العمل"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          {habit.isCustom && onDeleteCustom && (
            <button
              type="button"
              onClick={() => onDeleteCustom(habit.id)}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="حذف هذا البند"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Reward/Hadith Section */}
      {showReward && habit.reward && (
        <div className="mt-2.5 p-2.5 bg-amber-50/90 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-950 dark:text-amber-200 font-amiri leading-relaxed animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-bold mb-1 font-cairo text-[11px]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>فضل العمل وأثره:</span>
          </div>
          {habit.reward}
        </div>
      )}
    </div>
  );
};
