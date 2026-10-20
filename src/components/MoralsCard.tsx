import React, { useState } from 'react';
import { Heart, Check, Save, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { HabitItem } from '../types';
import { speakArabicPhrase } from '../utils/audio';

interface MoralsCardProps {
  habit: HabitItem;
  completed: boolean;
  obstacleNote: string;
  onToggleComplete: (habitId: string, completed: boolean) => void;
  onSaveObstacleNote: (habitId: string, note: string) => void;
}

export const MoralsCard: React.FC<MoralsCardProps> = ({
  habit,
  completed,
  obstacleNote,
  onToggleComplete,
  onSaveObstacleNote,
}) => {
  const [note, setNote] = useState(obstacleNote || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showObstacleBox, setShowObstacleBox] = useState(Boolean(obstacleNote));

  const handleToggle = () => {
    const next = !completed;
    onToggleComplete(habit.id, next);
    if (next) {
      speakArabicPhrase('جزاك الله خيراً ونفع بك');
    }
  };

  const handleSave = () => {
    onSaveObstacleNote(habit.id, note);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
        completed
          ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 shadow-xs'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xs hover:border-stone-300'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-start gap-3 flex-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggle}
            className="mt-1 w-5 h-5 rounded-md accent-rose-700 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm sm:text-base font-bold font-cairo leading-snug ${
                completed ? 'text-rose-950 dark:text-rose-200' : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {habit.title}
            </h3>
            {habit.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo mt-0.5 leading-relaxed">
                {habit.description}
              </p>
            )}
          </div>
        </label>

        {/* Toggle reflection button */}
        <button
          type="button"
          onClick={() => setShowObstacleBox(!showObstacleBox)}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors shrink-0 ${
            showObstacleBox || obstacleNote
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
          }`}
          title="تسجيل موقف منع من تطبيق هذا الخلق"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">موقف أو عائق</span>
          {showObstacleBox ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Virtue / reward quote if available */}
      {habit.reward && (
        <p className="font-amiri text-xs text-stone-600 dark:text-stone-400 mt-2 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg">
          {habit.reward}
        </p>
      )}

      {/* Reflection Note for Obstacles / Situations requested by user */}
      {showObstacleBox && (
        <div className="mt-3 p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 font-cairo flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>مواقف وتحديات اليوم (ما منعني أو كان عقبة أمام تطبيق هذا الخلق):</span>
            </span>
          </div>

          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="اكتب الموقف بصراحة مع نفسك: مثلاً مجلس خاض في الغيبة، أو موقف أغضبني فاستعجلت، وما أستدركه بالتوبة..."
            className="w-full p-2.5 text-xs bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-800/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-cairo text-stone-900 dark:text-stone-100 leading-relaxed resize-none"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-400 font-cairo">
              محاسبة النفس الصريحة أول طريق الإصلاح
            </span>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-2xs ${
                isSaved
                  ? 'bg-emerald-700 text-white'
                  : 'bg-amber-800 hover:bg-amber-900 text-amber-100'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'تم الحفظ بنجاح!' : 'حفظ الملحوظة'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
