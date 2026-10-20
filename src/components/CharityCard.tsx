import React, { useState } from 'react';
import { HeartHandshake, Plus, Minus, Check, Sparkles, Trash2 } from 'lucide-react';
import { CharityGoal } from '../types';
import { speakArabicPhrase } from '../utils/audio';

interface CharityCardProps {
  goals: CharityGoal[];
  onUpdateGoal: (goalId: string, current: number) => void;
  onAddGoal: (goal: CharityGoal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const DEFAULT_CHARITY_PRESETS: CharityGoal[] = [
  { id: 'c_money', title: 'صدقة مالية ولو بشق تمرة', target: 1, current: 0, unit: 'مرة' },
  { id: 'c_food', title: 'إطعام مسكين أو سقي ماء أو إفطار صائم', target: 1, current: 0, unit: 'مرة' },
  { id: 'c_parents', title: 'بر الوالدين وخدمتهما وإدخال السرور عليهما', target: 1, current: 0, unit: 'عمل' },
  { id: 'c_family', title: 'صلة رحم والتواصل مع الأقارب والأرحام', target: 1, current: 0, unit: 'تواصل' },
  { id: 'c_help', title: 'قضاء حاجة مسلم أو تفريج كربة أو كلمة طيبة', target: 1, current: 0, unit: 'معروف' },
];

export const CharityCard: React.FC<CharityCardProps> = ({
  goals,
  onUpdateGoal,
  onAddGoal,
  onDeleteGoal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(1);
  const [newUnit, setNewUnit] = useState('مرة');

  const activeGoals = goals && goals.length > 0 ? goals : DEFAULT_CHARITY_PRESETS;

  // Calculate completion rate
  let totalTasks = activeGoals.length;
  let completedTasks = 0;
  activeGoals.forEach((g) => {
    if (g.current >= g.target) completedTasks++;
    else if (g.current > 0) completedTasks += g.current / g.target;
  });
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isAllDone = rate >= 100;

  const handleIncrement = (g: CharityGoal, delta: number) => {
    const next = Math.max(0, g.current + delta);
    onUpdateGoal(g.id, next);
    if (next >= g.target && g.current < g.target) {
      speakArabicPhrase('جزاك الله خيراً ونفع بك');
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created: CharityGoal = {
      id: `charity_${Date.now()}`,
      title: newTitle.trim(),
      target: Number(newTarget) || 1,
      current: 0,
      unit: newUnit.trim() || 'مرة',
    };
    onAddGoal(created);
    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 flex items-center justify-center font-bold text-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo">
                أهداف البر والصدقة والإحسان
              </h3>
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                «تطفئ الخطيئة»
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo mt-0.5">
              ضع أهدافك اليومية في الصدقة والبر وتفقد المسلمين
            </p>
          </div>
        </div>

        {/* Completion percentage */}
        <div className="text-left">
          <span
            className={`text-lg font-bold font-cairo tabular-nums ${
              isAllDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            {rate}%
          </span>
          <span className="text-[10px] text-stone-400 block tabular-nums">
            {Math.round(completedTasks)} من {totalTasks} أهداف
          </span>
        </div>
      </div>

      {/* Goals list */}
      <div className="space-y-2.5">
        {activeGoals.map((goal) => {
          const isDone = goal.current >= goal.target;

          return (
            <div
              key={goal.id}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                  : 'bg-stone-50/80 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-700/80'
              }`}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-rose-800 text-white'
                        : 'border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-bold font-cairo ${
                      isDone
                        ? 'text-rose-950 dark:text-rose-200 line-through opacity-85'
                        : 'text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    {goal.title}
                  </span>
                </div>

                {/* Stepper controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-800 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleIncrement(goal, -1)}
                      disabled={goal.current <= 0}
                      className="p-1 px-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 min-h-[30px] min-w-[30px] flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs sm:text-sm font-bold font-cairo tabular-nums text-stone-900 dark:text-stone-100">
                      {goal.current} / {goal.target}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(goal, 1)}
                      className="p-1 px-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 min-h-[30px] min-w-[30px] flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isDone && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateGoal(goal.id, goal.target);
                        speakArabicPhrase('جزاك الله خيراً ونفع بك');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-md border border-rose-200 dark:border-rose-900/60 whitespace-nowrap min-h-[30px]"
                    >
                      إنجاز
                    </button>
                  )}

                  {goal.id.startsWith('charity_') && (
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                      title="حذف هذا الهدف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Goal Button / Form */}
      {!showAddForm ? (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة هدف بر أو صدقة جديد</span>
        </button>
      ) : (
        <form
          onSubmit={handleCreateGoal}
          className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2.5 animate-in fade-in duration-200"
        >
          <div>
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block mb-1 font-cairo">
              اسم العمل أو الصدقة:
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثال: التصدق بوجبة إطعام، أو مهاتفة عمي أو عمتي..."
              className="w-full text-xs font-cairo p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-0.5">
                الهدف الرقمي:
              </label>
              <input
                type="number"
                min="1"
                value={newTarget}
                onChange={(e) => setNewTarget(Number(e.target.value))}
                className="w-full text-xs font-bold font-cairo p-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 tabular-nums"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-0.5">
                الوحدة:
              </label>
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="مرة، عمل..."
                className="w-full text-xs font-cairo p-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-stone-600 dark:text-stone-400"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-lg shadow-2xs"
            >
              إضافة الهدف
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
