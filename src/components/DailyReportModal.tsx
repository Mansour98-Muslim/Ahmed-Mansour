import React, { useState } from 'react';
import { X, Printer, Copy, Check, Share2, Award, Calendar, User, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { DayRecord, HabitItem, UserProfile } from '../types';
import { formatGregorianArabic, formatHijriArabic } from '../utils/dateUtils';
import { calculateCompletion } from '../utils/storage';
import { CATEGORIES } from '../data/defaultHabits';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DayRecord;
  habits: HabitItem[];
  profile: UserProfile;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  record,
  habits,
  profile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const hijriStr = formatHijriArabic(record.date);
  const gregorianStr = formatGregorianArabic(record.date);
  const completion = calculateCompletion(habits, record.values);

  // Group completed and uncompleted
  const completedList = habits.filter((h) => {
    const v = record.values[h.id];
    if (h.type === 'boolean') return Boolean(v);
    if (h.type === 'counter') return typeof v === 'number' && v >= (h.targetCount || 1);
    return false;
  });

  const uncompletedList = habits.filter((h) => {
    const v = record.values[h.id];
    if (h.type === 'boolean') return !v;
    if (h.type === 'counter') return !v || (typeof v === 'number' && v < (h.targetCount || 1));
    return true;
  });

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Generate clean text for copying to WhatsApp / Notes
  const generateReportText = () => {
    let text = `📜 *تقرير محاسبة النفس اليومي*\n`;
    text += `👤 *المحاسب لنفسه:* ${profile.name}\n`;
    text += `📅 *التاريخ:* ${hijriStr} | ${gregorianStr}\n`;
    text += `📊 *نسبة الإنجاز:* ${completion.percentage}% (${completion.grade.label})\n`;
    text += `✅ *المنجز:* ${completion.completedCount} من أصل ${completion.totalCount} طاعة\n\n`;

    text += `✨ *أبرز الطاعات المنجزة:*\n`;
    completedList.slice(0, 10).forEach((item) => {
      text += `• ${item.title}\n`;
    });
    if (completedList.length > 10) {
      text += `• وغيرها ${completedList.length - 10} طاعة مباركة.\n`;
    }

    if (uncompletedList.length > 0) {
      text += `\n⏳ *ما يستدرك بالتوبة والعزم غداً:*\n`;
      uncompletedList.slice(0, 5).forEach((item) => {
        text += `• ${item.title}\n`;
      });
    }

    if (record.qiyamData && (record.qiyamData.completedRakats > 0 || record.qiyamData.witrCompleted)) {
      text += `\n🌙 *قيام الليل:* صلى ${record.qiyamData.completedRakats} ركعة ${record.qiyamData.witrCompleted ? 'مع الوتر' : ''}\n`;
    }

    if (record.charityGoals && record.charityGoals.some(g => g.current > 0)) {
      text += `\n💖 *أعمال البر والصدقة:*\n`;
      record.charityGoals.filter(g => g.current > 0).forEach(g => {
        text += `• ${g.title}: ${g.current}/${g.target} ${g.unit}\n`;
      });
    }

    if (record.moralObstacleNotes && Object.values(record.moralObstacleNotes).some(n => n && n.trim())) {
      text += `\n⚠️ *مواقف وتحديات الأخلاق اليوم:*\n`;
      Object.entries(record.moralObstacleNotes).forEach(([habitId, note]) => {
        if (note && note.trim()) {
          const h = habits.find(item => item.id === habitId);
          text += `• ${h ? h.title : 'خلق'}: ${note.trim()}\n`;
        }
      });
    }

    if (record.notes.trim()) {
      text += `\n📝 *وقفة النفس:* ${record.notes.trim()}\n`;
    }
    if (record.tomorrowIntention.trim()) {
      text += `🎯 *نية الغد:* ${record.tomorrowIntention.trim()}\n`;
    }

    text += `\n«حاسبوا أنفسكم قبل أن تُحاسبوا، وزِنوا أنفسكم قبل أن تُوزنوا»`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleShare = async () => {
    const text = generateReportText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تقرير محاسبة النفس - ${profile.name}`,
          text: text,
        });
      } catch {
        // Ignored or cancelled
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo">تقرير المحاسبة اليومي</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs"
              title="طباعة التقرير أو حفظ كـ PDF"
            >
              <Printer className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span className="hidden sm:inline">طباعة / PDF</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs"
              title="نسخ نص التقرير"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-600 dark:text-stone-400" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs"
              title="مشاركة التقرير"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>مشاركة</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors mr-1"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate / Document Area */}
        <div id="printable-report" className="p-6 sm:p-8 bg-stone-50/50">
          {/* Certificate Inner Frame with Islamic Double Border */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-emerald-900/20 shadow-sm relative overflow-hidden">
            {/* Top Ornamental Bismillah */}
            <div className="text-center pb-5 border-b border-stone-200">
              <p className="font-amiri text-lg text-emerald-900 font-bold tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                تقرير محاسبة النفس والعمل الصالح
              </h1>
              <p className="font-amiri text-xs text-stone-500 italic mt-0.5">
                «حاسبوا أنفسكم قبل أن تُحاسبوا، وزِنوا أنفسكم قبل أن تُوزنوا»
              </p>
            </div>

            {/* Profile & Date Metadata Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-stone-100 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
                  <User className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block">المحاسب لنفسه:</span>
                  <span className="font-bold text-stone-900 font-cairo text-base">
                    {profile.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block">التاريخ والميقات:</span>
                  <span className="font-semibold text-stone-900 font-amiri text-sm block">
                    {hijriStr}
                  </span>
                  <span className="text-[11px] text-stone-500 font-cairo">
                    الموافق: {gregorianStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Performance Card */}
            <div className="my-5 p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-right">
                <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-amber-300 flex flex-col items-center justify-center shadow-xs">
                  <span className="text-xl font-bold font-cairo tabular-nums leading-none">
                    {completion.percentage}%
                  </span>
                  <span className="text-[9px] text-emerald-100 mt-1">الإنجاز</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xl">{completion.grade.emoji}</span>
                    <h3 className="font-bold text-base text-stone-900 font-cairo">
                      {completion.grade.label}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed font-cairo">
                    {completion.grade.sublabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-stone-700 font-cairo border-t sm:border-t-0 sm:border-r border-stone-200 pt-3 sm:pt-0 sm:pr-4">
                <div className="text-center">
                  <span className="text-emerald-800 text-base font-bold font-cairo tabular-nums block">
                    {completion.completedCount}
                  </span>
                  <span className="text-stone-500 text-[10px]">طاعات منجزة</span>
                </div>
                <div className="text-center">
                  <span className="text-stone-700 text-base font-bold font-cairo tabular-nums block">
                    {completion.totalCount}
                  </span>
                  <span className="text-stone-500 text-[10px]">إجمالي البنود</span>
                </div>
              </div>
            </div>

            {/* Breakdown by categories */}
            <div className="space-y-4 my-5">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-cairo border-b border-stone-200 pb-1 flex items-center justify-between">
                <span>بيان تفصيلي بالطاعات المنجزة</span>
                <span className="text-emerald-800 font-semibold text-[11px] tabular-nums">
                  {completedList.length} طاعة مؤداة
                </span>
              </h4>

              {CATEGORIES.map((cat) => {
                const catHabits = habits.filter((h) => h.category === cat.id);
                if (catHabits.length === 0) return null;

                return (
                  <div key={cat.id} className="text-xs">
                    <span className="font-bold text-stone-800 block mb-1 font-cairo">
                      {cat.name}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {catHabits.map((habit) => {
                        const val = record.values[habit.id];
                        let isDone = false;
                        let countDisplay = '';
                        if (habit.type === 'boolean') {
                          isDone = Boolean(val);
                        } else {
                          const c = typeof val === 'number' ? val : 0;
                          isDone = c >= (habit.targetCount || 1);
                          countDisplay = ` (${c}/${habit.targetCount || 1} ${habit.unit || ''})`;
                        }

                        return (
                          <div
                            key={habit.id}
                            className={`flex items-center gap-1.5 p-1.5 rounded-md ${
                              isDone ? 'bg-emerald-50/70 text-emerald-950 font-medium' : 'text-stone-400 bg-stone-50/50'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                            )}
                            <span className="truncate">{habit.title}{countDisplay}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charity & Righteousness Goals achieved if any */}
            {record.charityGoals && record.charityGoals.some((g) => g.current > 0) && (
              <div className="my-4 pt-3 border-t border-stone-200 text-xs font-cairo">
                <span className="font-bold text-rose-900 block mb-1.5">
                  أعمال البر والصدقة المؤداة:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {record.charityGoals.filter((g) => g.current > 0).map((g) => (
                    <div key={g.id} className="p-2 rounded-lg bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                      <span className="font-medium text-stone-800">{g.title}</span>
                      <span className="text-[11px] font-bold text-rose-800 tabular-nums">
                        {g.current} / {g.target} {g.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moral Obstacle Notes if entered */}
            {record.moralObstacleNotes && Object.values(record.moralObstacleNotes).some((n) => n && n.trim()) && (
              <div className="my-4 pt-3 border-t border-stone-200 text-xs font-cairo">
                <span className="font-bold text-amber-900 block mb-1.5">
                  مواقف وتحديات الأخلاق اليومية (ما منع من تطبيق الخلق):
                </span>
                <div className="space-y-2">
                  {Object.entries(record.moralObstacleNotes).map(([habitId, note]) => {
                    if (!note || !note.trim()) return null;
                    const h = habits.find((item) => item.id === habitId);
                    return (
                      <div key={habitId} className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                        <span className="font-bold text-amber-950 block text-[11px] mb-0.5">
                          {h ? h.title : 'خلق'}:
                        </span>
                        <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                          {note.trim()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Self-Reflection & Tomorrow's Intention if entered */}
            {(record.notes || record.tomorrowIntention) && (
              <div className="my-5 pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-cairo">
                {record.notes && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block mb-1">
                      وقفة مع النفس والمحاسبة:
                    </span>
                    <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                      {record.notes}
                    </p>
                  </div>
                )}
                {record.tomorrowIntention && (
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-950 block mb-1">
                      عقد النية والغد بإذن الله:
                    </span>
                    <p className="text-emerald-900 leading-relaxed whitespace-pre-line">
                      {record.tomorrowIntention}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Closing stamp and dua */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-center sm:text-right gap-2 text-xs text-stone-500 font-amiri text-sm">
              <p>
                «اللَّهُمَّ إِنِّي أَسْأَلُكَ فِعْلَ الْخَيْرَاتِ، وَتَرْكَ الْمُنْكَرَاتِ، وَحُبَّ الْمَسَاكِينِ»
              </p>
              <span className="text-[11px] font-cairo text-stone-400">
                صدر من تطبيق محاسبة النفس
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="no-print p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>
    </div>
  );
};
