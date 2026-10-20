import React, { useState } from 'react';
import { Sun, Moon, Check, ChevronDown, ChevronUp, Plus, Minus, Sparkles, BookOpen } from 'lucide-react';
import { MORNING_ADHKAR, EVENING_ADHKAR, AdhkarItem } from '../data/adhkarData';
import { speakArabicPhrase } from '../utils/audio';

interface AdhkarCardProps {
  type: 'morning' | 'evening' | 'counter';
  title: string;
  description?: string;
  reward?: string;
  // For morning/evening detailed progress:
  detailedProgress?: Record<string, number>;
  onUpdateDetailedProgress?: (dhikrId: string, count: number) => void;
  // For counter dhikr:
  count?: number;
  customTarget?: number;
  onUpdateCount?: (count: number) => void;
  onUpdateCustomTarget?: (target: number) => void;
  onOpenTasbeeh?: () => void;
}

export const AdhkarCard: React.FC<AdhkarCardProps> = ({
  type,
  title,
  description,
  reward,
  detailedProgress = {},
  onUpdateDetailedProgress,
  count = 0,
  customTarget = 100,
  onUpdateCount,
  onUpdateCustomTarget,
  onOpenTasbeeh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // If this is Morning or Evening detailed checklist
  if (type === 'morning' || type === 'evening') {
    const list = type === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR;
    const isMorning = type === 'morning';

    // Calculate completed count
    let completedItems = 0;
    list.forEach((item) => {
      const doneCount = detailedProgress[item.id] || 0;
      if (doneCount >= item.count) completedItems++;
    });

    const rate = Math.round((completedItems / list.length) * 100);
    const isAllDone = rate >= 100;

    const handleIncrementDhikr = (item: AdhkarItem) => {
      if (!onUpdateDetailedProgress) return;
      const current = detailedProgress[item.id] || 0;
      const next = current + 1;
      onUpdateDetailedProgress(item.id, next);
      if (next === item.count) {
        speakArabicPhrase('الحمد لله');
      }
    };

    const handleCompleteAll = () => {
      if (!onUpdateDetailedProgress) return;
      list.forEach((item) => {
        onUpdateDetailedProgress(item.id, item.count);
      });
      speakArabicPhrase('الحمد لله');
    };

    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                isMorning
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
              }`}
            >
              {isMorning ? <Sun className="w-5 h-5 text-amber-600" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo">
                {title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo">
                {description || (isMorning ? 'حصن الصباح ووقاية النهار' : 'حصن المساء وسكينة الليل')}
              </p>
            </div>
          </div>

          {/* Progress rate */}
          <div className="text-left">
            <span
              className={`text-lg font-bold font-cairo tabular-nums ${
                isAllDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              {rate}%
            </span>
            <span className="text-[10px] text-stone-400 block tabular-nums">
              {completedItems} من {list.length} أذكار
            </span>
          </div>
        </div>

        {/* Action strip */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <span>{isExpanded ? 'إخفاء الأذكار' : 'عرض وقراءة الأذكار بالتفصيل'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {!isAllDone && (
            <button
              onClick={handleCompleteAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
            >
              إتمام كامل الورد
            </button>
          )}
        </div>

        {/* Expandable Adhkar list */}
        {isExpanded && (
          <div className="mt-3 space-y-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
            {list.map((item) => {
              const current = detailedProgress[item.id] || 0;
              const isItemDone = current >= item.count;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isItemDone
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-stone-50/80 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-amiri text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-relaxed font-medium">
                        «{item.text}»
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 font-cairo mt-1">
                        {item.virtue}
                      </p>
                    </div>

                    {/* Counter Button */}
                    <button
                      type="button"
                      onClick={() => handleIncrementDhikr(item)}
                      className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-xl shrink-0 transition-all active:scale-95 ${
                        isItemDone
                          ? 'bg-emerald-800 text-white'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {isItemDone ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span className="text-[10px] font-bold mt-0.5">تم</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold font-cairo tabular-nums">
                            {current} / {item.count}
                          </span>
                          <span className="text-[9px] mt-0.5">اضغط</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Otherwise, this is a Counter Dhikr (الاستغفار، الصلاة على النبي، الباقيات الصالحات)
  const effectiveTarget = customTarget || 100;
  const isTargetAchieved = count >= effectiveTarget;
  const progressPercent = Math.min(100, Math.round((count / effectiveTarget) * 100));

  const handleIncrementCounter = (delta: number) => {
    if (!onUpdateCount) return;
    const next = Math.max(0, count + delta);
    onUpdateCount(next);
    if (next >= effectiveTarget && count < effectiveTarget) {
      speakArabicPhrase('الحمد لله');
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3.5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo">
                {title}
              </h3>
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                الموصى به: ١٠٠ مرة
              </span>
            </div>
            {description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Completion Percentage */}
        <div className="text-left">
          <span
            className={`text-lg font-bold font-cairo tabular-nums ${
              isTargetAchieved ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            {progressPercent}%
          </span>
          <span className="text-[10px] text-stone-400 block tabular-nums">
            {count} من {effectiveTarget}
          </span>
        </div>
      </div>

      {/* Target Setting & Counter Controls */}
      <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Custom Target Adjuster requested by user */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 font-cairo">
            هدفي في الذكر:
          </label>
          <select
            value={effectiveTarget}
            onChange={(e) => onUpdateCustomTarget && onUpdateCustomTarget(Number(e.target.value))}
            className="text-xs font-bold font-cairo px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
          >
            <option value={100}>١٠٠ مرة (الموصى به)</option>
            <option value={200}>٢٠٠ مرة</option>
            <option value={300}>٣٠٠ مرة</option>
            <option value={500}>٥٠٠ مرة</option>
            <option value={1000}>١٠٠٠ مرة (همة عالية)</option>
          </select>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-800 shadow-2xs">
            <button
              type="button"
              onClick={() => handleIncrementCounter(-1)}
              disabled={count <= 0}
              className="p-1 px-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center text-sm font-bold font-cairo tabular-nums text-stone-900 dark:text-stone-100">
              {count}
            </span>
            <button
              type="button"
              onClick={() => handleIncrementCounter(1)}
              className="p-1 px-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleIncrementCounter(10)}
            className="px-2 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-md tabular-nums min-h-[32px]"
          >
            +10
          </button>
          <button
            type="button"
            onClick={() => handleIncrementCounter(33)}
            className="px-2 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-md tabular-nums min-h-[32px]"
          >
            +33
          </button>

          {count < effectiveTarget && (
            <button
              type="button"
              onClick={() => {
                if (onUpdateCount) onUpdateCount(effectiveTarget);
                speakArabicPhrase('الحمد لله');
              }}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-md border border-emerald-200 dark:border-emerald-800 whitespace-nowrap min-h-[32px]"
            >
              إتمام الهدف
            </button>
          )}

          {onOpenTasbeeh && (
            <button
              type="button"
              onClick={onOpenTasbeeh}
              className="px-2.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded-md border border-teal-200 dark:border-teal-800 whitespace-nowrap min-h-[32px]"
            >
              بالمسبحة
            </button>
          )}
        </div>
      </div>

      {/* Reward tooltip toggle */}
      {reward && (
        <div className="pt-1">
          <button
            onClick={() => setShowReward(!showReward)}
            className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>فضل هذا الذكر العظيم</span>
          </button>
          {showReward && (
            <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-950 dark:text-amber-200 font-amiri leading-relaxed">
              {reward}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
