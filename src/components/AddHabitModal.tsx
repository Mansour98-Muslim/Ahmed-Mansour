import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { HabitCategory, HabitItem, HabitType } from '../types';
import { CATEGORIES } from '../data/defaultHabits';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (newHabit: HabitItem) => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('custom');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [type, setType] = useState<HabitType>('boolean');
  const [targetCount, setTargetCount] = useState(10);
  const [unit, setUnit] = useState('مرة');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: HabitItem = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim() || undefined,
      reward: reward.trim() || undefined,
      type,
      targetCount: type === 'counter' ? Number(targetCount) || 10 : undefined,
      unit: type === 'counter' ? unit.trim() || 'مرة' : undefined,
      isCustom: true,
    };

    onAddHabit(newHabit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo">إضافة طاعة أو هدف إيماني</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo">
              اسم العمل الصالح أو الطاعة *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قراءة صفحتين من كتاب رياض الصالحين"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo">
                التصنيف
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo">
                طريقة القياس
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as HabitType)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo"
              >
                <option value="boolean">نعم / لا (تم أو لم يتم)</option>
                <option value="counter">عداد كمي (أرقام)</option>
              </select>
            </div>
          </div>

          {type === 'counter' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo">
                  العدد المستهدف
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-stone-200 rounded-lg font-cairo tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo">
                  الوحدة
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="مرة، صفحة، تسبيحة..."
                  className="w-full px-3 py-1.5 text-sm bg-white border border-stone-200 rounded-lg font-cairo"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo">
              وصف توضيحي أو تذكرة (اختياري)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: بالتدبر والتأمل قبل النوم"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1 font-cairo">
              فضل العمل أو آية/حديث شريف (اختياري)
            </label>
            <textarea
              rows={2}
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="مثال: «أحب الأعمال إلى الله أدومها وإن قل»"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>إضافة للبند اليومي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
