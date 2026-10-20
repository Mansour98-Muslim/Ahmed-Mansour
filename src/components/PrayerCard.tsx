import React from 'react';
import { Check, Clock, Sun, Sparkles, BookOpen } from 'lucide-react';
import { PrayerDetail } from '../types';
import { speakArabicPhrase } from '../utils/audio';

export interface PrayerConfig {
  id: string; // 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  name: string;
  fardDescription: string;
  hasQabliyah?: boolean;
  qabliyahName?: string;
  qabliyahReward?: string;
  hasBadiyah?: boolean;
  badiyahName?: string;
  badiyahReward?: string;
  virtue: string;
}

export const PRAYERS_CONFIG: PrayerConfig[] = [
  {
    id: 'fajr',
    name: 'صلاة الفجر',
    fardDescription: 'الفريضة ركعتان في وقتها / جماعة للرجال',
    hasQabliyah: true,
    qabliyahName: 'سنة الفجر القبلية (ركعتان)',
    qabliyahReward: '«ركعتا الفجر خير من الدنيا وما فيها»',
    virtue: '«من صلى الصبح فهو في ذمة الله»',
  },
  {
    id: 'dhuhr',
    name: 'صلاة الظهر',
    fardDescription: 'الفريضة أربع ركعات في وقتها',
    hasQabliyah: true,
    qabliyahName: 'سنة الظهر القبلية (٤ ركعات)',
    qabliyahReward: '«تُفتح لها أبواب السماء»',
    hasBadiyah: true,
    badiyahName: 'سنة الظهر البعدية (ركعتان)',
    badiyahReward: 'من السنن الرواتب التي يُبنى بها بيت في الجنة',
    virtue: 'الصلاة الوسطى من النهار وحضور القلب',
  },
  {
    id: 'asr',
    name: 'صلاة العصر',
    fardDescription: 'الفريضة أربع ركعات (الصلاة الوسطى)',
    hasQabliyah: true,
    qabliyahName: 'سنة العصر القبلية (٤ ركعات مستحبة)',
    qabliyahReward: '«رحم الله امرأً صلى قبل العصر أربعاً»',
    virtue: '«من صلى البردين دخل الجنة» (الفجر والعصر)',
  },
  {
    id: 'maghrib',
    name: 'صلاة المغرب',
    fardDescription: 'الفريضة ثلاث ركعات في أول وقتها',
    hasBadiyah: true,
    badiyahName: 'سنة المغرب البعدية (ركعتان)',
    badiyahReward: 'من السنن الرواتب المؤكدة',
    virtue: '«لا تزال أمتي بخير ما لم يؤخروا المغرب»',
  },
  {
    id: 'isha',
    name: 'صلاة العشاء',
    fardDescription: 'الفريضة أربع ركعات في وقتها / جماعة',
    hasBadiyah: true,
    badiyahName: 'سنة العشاء البعدية (ركعتان)',
    badiyahReward: 'من السنن الرواتب وتليها صلاة الوتر',
    virtue: '«من صلى العشاء في جماعة فكأنما قام نصف الليل»',
  },
];

interface PrayerCardProps {
  prayer: PrayerConfig;
  detail: PrayerDetail;
  onChangeDetail: (prayerId: string, updated: PrayerDetail) => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayer,
  detail,
  onChangeDetail,
}) => {
  // Total components for this prayer (Fard + available sunnahs)
  let totalParts = 1; // Fard
  let completedParts = detail.fard ? 1 : 0;

  if (prayer.hasQabliyah) {
    totalParts++;
    if (detail.sunnahQabliyah) completedParts++;
  }
  if (prayer.hasBadiyah) {
    totalParts++;
    if (detail.sunnahBadiyah) completedParts++;
  }

  const rate = Math.round((completedParts / totalParts) * 100);
  const isFullyDone = rate === 100;

  const toggleFard = () => {
    const nextFard = !detail.fard;
    const updated = { ...detail, fard: nextFard };
    onChangeDetail(prayer.id, updated);
    if (nextFard) {
      speakArabicPhrase('الحمد لله');
    }
  };

  const toggleQabliyah = () => {
    const nextVal = !detail.sunnahQabliyah;
    const updated = { ...detail, sunnahQabliyah: nextVal };
    onChangeDetail(prayer.id, updated);
    if (nextVal) {
      speakArabicPhrase('الحمد لله');
    }
  };

  const toggleBadiyah = () => {
    const nextVal = !detail.sunnahBadiyah;
    const updated = { ...detail, sunnahBadiyah: nextVal };
    onChangeDetail(prayer.id, updated);
    if (nextVal) {
      speakArabicPhrase('الحمد لله');
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
        isFullyDone
          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-sm'
          : detail.fard
          ? 'bg-white dark:bg-stone-900 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 shadow-2xs'
      }`}
    >
      {/* Top Header: Prayer Name & Internal Percentage */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
              isFullyDone
                ? 'bg-emerald-800 text-white'
                : detail.fard
                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo">
              {prayer.name}
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-cairo">
              {prayer.virtue}
            </span>
          </div>
        </div>

        {/* Completion rate badge */}
        <div className="text-left">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-lg font-bold font-cairo tabular-nums ${
                isFullyDone
                  ? 'text-emerald-800 dark:text-emerald-400'
                  : detail.fard
                  ? 'text-teal-700 dark:text-teal-400'
                  : 'text-stone-400'
              }`}
            >
              {rate}%
            </span>
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 block tabular-nums">
            {completedParts} من {totalParts}
          </span>
        </div>
      </div>

      {/* Linked Checklist (Fard + Sunnahs) */}
      <div className="mt-3.5 space-y-2.5">
        {/* 1. Obligatory Prayer (الفريضة) */}
        <label className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer select-none transition-colors">
          <input
            type="checkbox"
            checked={Boolean(detail.fard)}
            onChange={toggleFard}
            className="mt-0.5 w-5 h-5 rounded-md accent-emerald-800 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block font-cairo">
              الفريضة المفروضة
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-cairo">
              {prayer.fardDescription}
            </span>
          </div>
          {detail.fard && (
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md shrink-0">
              أُديت بحمد الله
            </span>
          )}
        </label>

        {/* 2. Sunnah Qabliyah if exists */}
        {prayer.hasQabliyah && (
          <label className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={Boolean(detail.sunnahQabliyah)}
              onChange={toggleQabliyah}
              className="mt-0.5 w-5 h-5 rounded-md accent-teal-700 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 block font-cairo flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-teal-600" />
                {prayer.qabliyahName}
              </span>
              {prayer.qabliyahReward && (
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-cairo">
                  {prayer.qabliyahReward}
                </span>
              )}
            </div>
            {detail.sunnahQabliyah && (
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-md shrink-0">
                أُديت
              </span>
            )}
          </label>
        )}

        {/* 3. Sunnah Badiyah if exists */}
        {prayer.hasBadiyah && (
          <label className="flex items-start gap-3 p-2.5 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={Boolean(detail.sunnahBadiyah)}
              onChange={toggleBadiyah}
              className="mt-0.5 w-5 h-5 rounded-md accent-teal-700 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 block font-cairo flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                {prayer.badiyahName}
              </span>
              {prayer.badiyahReward && (
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-cairo">
                  {prayer.badiyahReward}
                </span>
              )}
            </div>
            {detail.sunnahBadiyah && (
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-md shrink-0">
                أُديت
              </span>
            )}
          </label>
        )}
      </div>

      {/* Progress mini bar */}
      <div className="mt-3.5 w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFullyDone ? 'bg-emerald-700' : 'bg-teal-600'
          }`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
};
