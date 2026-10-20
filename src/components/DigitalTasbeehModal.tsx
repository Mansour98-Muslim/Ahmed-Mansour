import React, { useState } from 'react';
import { X, RotateCcw, Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { HabitItem } from '../types';

interface DigitalTasbeehModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHabit?: HabitItem | null;
  onApplyCountToHabit?: (habitId: string, count: number) => void;
}

const PRESETS = [
  { label: 'أستغفر الله وأتوب إليه', target: 100, habitId: 'istighfar_100' },
  { label: 'اللهم صل وسلم على نبينا محمد', target: 100, habitId: 'salawat_100' },
  { label: 'سبحان الله وبحمده سبحان الله العظيم', target: 100, habitId: 'tasbeeh_general' },
  { label: 'لا حول ولا قوة إلا بالله', target: 33, habitId: 'tasbeeh_general' },
  { label: 'سبحان الله والحمد لله ولا إله إلا الله والله أكبر', target: 100, habitId: 'tasbeeh_general' },
];

export const DigitalTasbeehModal: React.FC<DigitalTasbeehModalProps> = ({
  isOpen,
  onClose,
  initialHabit,
  onApplyCountToHabit,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(
    initialHabit
      ? { label: initialHabit.title, target: initialHabit.targetCount || 100, habitId: initialHabit.id }
      : PRESETS[0]
  );
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(selectedPreset.target);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  if (!isOpen) return null;

  const handleTap = () => {
    const next = count + 1;
    setCount(next);

    // Haptic feedback if supported
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      if (next % 33 === 0 || next === target) {
        navigator.vibrate([40, 60, 40]);
      } else {
        navigator.vibrate(20);
      }
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleApplyToHabit = () => {
    if (onApplyCountToHabit && selectedPreset.habitId) {
      onApplyCountToHabit(selectedPreset.habitId, count);
    }
    onClose();
  };

  const selectPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset);
    setTarget(preset.target);
    setCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-2xl border border-stone-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-stone-100 font-cairo">المسبحة الإلكترونية</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHapticEnabled(!hapticEnabled)}
              className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition-colors"
              title={hapticEnabled ? 'تعطيل الاهتزاز' : 'تفعيل الاهتزاز'}
            >
              {hapticEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="my-4 space-y-1.5">
          <span className="text-[11px] text-stone-400 block font-cairo">اختر الذكر المبارك:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => selectPreset(p)}
                className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition-colors shrink-0 ${
                  selectedPreset.label === p.label
                    ? 'bg-emerald-800 text-white font-semibold'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {p.label.length > 25 ? p.label.slice(0, 25) + '...' : p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dhikr Title Display */}
        <div className="text-center my-3 min-h-[50px] flex items-center justify-center px-4">
          <p className="font-amiri text-lg text-amber-300 leading-relaxed font-semibold">
            «{selectedPreset.label}»
          </p>
        </div>

        {/* Big Tap Area / Counter Bead */}
        <div className="my-6 flex flex-col items-center">
          <button
            onClick={handleTap}
            className="group relative w-48 h-48 rounded-full bg-gradient-to-b from-stone-800 to-stone-950 border-4 border-emerald-700/60 shadow-xl hover:border-emerald-500 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer select-none ring-8 ring-stone-900/50"
          >
            <span className="text-5xl font-extrabold font-cairo text-amber-300 tracking-tight tabular-nums">
              {count}
            </span>
            <span className="text-xs text-stone-400 mt-1 font-cairo">
              الهدف: {target}
            </span>

            {/* Subtle pulse ring on tap */}
            <div className="absolute inset-2 rounded-full border border-stone-700 pointer-events-none" />
          </button>
          <span className="text-[11px] text-stone-400 mt-3 font-cairo">
            المس الدائرة للتسبيح
          </span>
        </div>

        {/* Counter controls & apply */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير</span>
          </button>

          <div className="flex items-center gap-2">
            {onApplyCountToHabit && (
              <button
                onClick={handleApplyToHabit}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>حفظ في جدول اليوم</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-stone-400 hover:text-stone-200"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
