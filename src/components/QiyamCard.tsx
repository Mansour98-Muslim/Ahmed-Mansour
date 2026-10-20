import React from 'react';
import { Moon, Sparkles, Plus, Minus, Check, BookOpen } from 'lucide-react';
import { QiyamTarget } from '../types';
import { getSurahsByJuz } from '../data/quranData';
import { speakArabicPhrase } from '../utils/audio';

interface QiyamCardProps {
  data: QiyamTarget;
  onChange: (updated: QiyamTarget) => void;
}

export const QiyamCard: React.FC<QiyamCardProps> = ({ data, onChange }) => {
  const juzList = getSurahsByJuz();

  const targetRakats = data.targetRakats || 8;
  const completedRakats = data.completedRakats || 0;
  const isWitrDone = Boolean(data.witrCompleted);

  // Completion rate (Rak'ahs progress + Witr)
  const totalTargetWithWitr = targetRakats + 1; // +1 for witr
  const totalDoneWithWitr = Math.min(targetRakats, completedRakats) + (isWitrDone ? 1 : 0);
  const rate = Math.round((totalDoneWithWitr / totalTargetWithWitr) * 100);
  const isAllDone = rate >= 100;

  const updateField = (field: keyof QiyamTarget, val: any) => {
    const updated = { ...data, [field]: val };
    onChange(updated);
  };

  const handleIncrement = (delta: number) => {
    const next = Math.max(0, completedRakats + delta);
    const updated = { ...data, completedRakats: next };
    onChange(updated);
    if (next >= targetRakats && !isAllDone) {
      speakArabicPhrase('الحمد لله');
    }
  };

  const handleToggleWitr = () => {
    const next = !isWitrDone;
    const updated = { ...data, witrCompleted: next };
    onChange(updated);
    if (next) {
      speakArabicPhrase('الحمد لله');
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo">
                قيام الليل وصلاة الوتر
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                شرف المؤمن
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo mt-0.5">
              «أفضل الصلاة بعد الفريضة صلاة الليل»
            </p>
          </div>
        </div>

        {/* Completion rate badge */}
        <div className="text-left">
          <span
            className={`text-lg font-bold font-cairo tabular-nums ${
              isAllDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            {rate}%
          </span>
          <span className="text-[10px] text-stone-400 block tabular-nums">
            {totalDoneWithWitr} من {totalTargetWithWitr} ركعة
          </span>
        </div>
      </div>

      {/* Target Rak'ahs and Stepper */}
      <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/80 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Target setting */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 font-cairo">
              الهدف المستهدف للقيام:
            </label>
            <select
              value={targetRakats}
              onChange={(e) => updateField('targetRakats', Number(e.target.value))}
              className="text-xs font-bold font-cairo px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            >
              <option value={2}>٢ ركعات</option>
              <option value={4}>٤ ركعات</option>
              <option value={8}>٨ ركعات (سنة النبي ﷺ)</option>
              <option value={10}>١٠ ركعات</option>
              <option value={12}>١٢ ركعة</option>
              <option value={20}>٢٠ ركعة</option>
            </select>
          </div>

          {/* Stepper for completed rak'ahs */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
              الركعات المؤداة:
            </span>
            <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-800 shadow-2xs">
              <button
                type="button"
                onClick={() => handleIncrement(-2)}
                disabled={completedRakats <= 0}
                className="p-1.5 px-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 disabled:opacity-30 min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                title="إنقاص ركعتين"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-10 text-center text-sm font-bold font-cairo tabular-nums text-stone-900 dark:text-stone-100">
                {completedRakats}
              </span>

              <button
                type="button"
                onClick={() => handleIncrement(2)}
                className="p-1.5 px-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                title="زيادة ركعتين"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => updateField('completedRakats', targetRakats)}
              className="px-2 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-md border border-emerald-200 dark:border-emerald-800 whitespace-nowrap min-h-[32px]"
            >
              إتمام الركعات
            </button>
          </div>
        </div>

        {/* Witr Checkbox */}
        <label className="flex items-center gap-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isWitrDone}
            onChange={handleToggleWitr}
            className="w-4 h-4 rounded accent-indigo-700 cursor-pointer"
          />
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 font-cairo">
            صلاة ركعة الوتر (خاتمة صلاة الليل)
          </span>
          {isWitrDone && (
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md mr-auto">
              تمت بحمد الله
            </span>
          )}
        </label>
      </div>

      {/* Quran recitation in Qiyam (Surahs grouped by 30 Juz and Ayah inputs) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 font-cairo">
          <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>القراءة وتلاوة القرآن في القيام (مقسّمة بأجزاء القرآن الثلاثين):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Surah & Ayah */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700/80 space-y-2">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block font-cairo">
              بداية القراءة في الركعات:
            </span>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-0.5">
                  السورة:
                </label>
                <select
                  value={data.surahFrom || 1}
                  onChange={(e) => updateField('surahFrom', Number(e.target.value))}
                  className="w-full text-xs font-medium font-cairo p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                >
                  {juzList.map((juz) => (
                    <optgroup key={juz.juzNumber} label={`📖 ${juz.name}`}>
                      {juz.surahs.map((surah) => (
                        <option key={surah.number} value={surah.number}>
                          {surah.number}. سورة {surah.name} ({surah.totalAyahs} آية)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-0.5">
                  من الآية رقم:
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.ayahFrom || 1}
                  onChange={(e) => updateField('ayahFrom', Number(e.target.value))}
                  className="w-full text-xs font-bold font-cairo p-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 tabular-nums"
                  placeholder="١"
                />
              </div>
            </div>
          </div>

          {/* End Surah & Ayah */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700/80 space-y-2">
            <span className="text-[11px] font-bold text-teal-800 dark:text-teal-400 block font-cairo">
              نهاية القراءة في الركعات:
            </span>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-0.5">
                  السورة:
                </label>
                <select
                  value={data.surahTo || 2}
                  onChange={(e) => updateField('surahTo', Number(e.target.value))}
                  className="w-full text-xs font-medium font-cairo p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                >
                  {juzList.map((juz) => (
                    <optgroup key={juz.juzNumber} label={`📖 ${juz.name}`}>
                      {juz.surahs.map((surah) => (
                        <option key={surah.number} value={surah.number}>
                          {surah.number}. سورة {surah.name} ({surah.totalAyahs} آية)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-0.5">
                  إلى الآية رقم:
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.ayahTo || 50}
                  onChange={(e) => updateField('ayahTo', Number(e.target.value))}
                  className="w-full text-xs font-bold font-cairo p-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 tabular-nums"
                  placeholder="٥٠"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
