import { DayRecord, HabitItem, UserProfile, DaySummary } from '../types';
import { DEFAULT_HABITS } from '../data/defaultHabits';
import { getTodayIsoString, shiftDate } from './dateUtils';

const STORAGE_KEYS = {
  PROFILE: 'muhasaba_user_profile',
  CUSTOM_HABITS: 'muhasaba_custom_habits',
  DAY_RECORDS: 'muhasaba_day_records',
};

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return {
    name: 'عبد الله',
    targetRate: 80,
    joinDate: getTodayIsoString(),
    reminderEnabled: false,
    reminderTime: '21:00',
  };
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function getStoredCustomHabits(): HabitItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_HABITS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom habits', e);
  }
  return [];
}

export function saveStoredCustomHabits(habits: HabitItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save custom habits', e);
  }
}

export function getAllHabits(): HabitItem[] {
  const customs = getStoredCustomHabits();
  return [...DEFAULT_HABITS, ...customs];
}

export function getStoredRecords(): Record<string, DayRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAY_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load records', e);
  }
  return {};
}

export function saveStoredRecords(records: Record<string, DayRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
}

export function getRecordForDate(date: string): DayRecord {
  const records = getStoredRecords();
  if (records[date]) {
    return records[date];
  }
  return {
    date,
    values: {},
    notes: '',
    tomorrowIntention: '',
    lastUpdated: new Date().toISOString(),
  };
}

export function saveRecordForDate(record: DayRecord): void {
  const records = getStoredRecords();
  records[record.date] = {
    ...record,
    lastUpdated: new Date().toISOString(),
  };
  saveStoredRecords(records);
}

/**
 * Calculate completion status and percentage for a list of habits and record values
 */
export function calculateCompletion(habits: HabitItem[], values: Record<string, boolean | number>): {
  completedCount: number;
  totalCount: number;
  percentage: number;
  grade: {
    label: string;
    sublabel: string;
    color: string;
    badgeBg: string;
    emoji: string;
  };
} {
  if (habits.length === 0) {
    return {
      completedCount: 0,
      totalCount: 0,
      percentage: 0,
      grade: {
        label: 'بداية مباركة',
        sublabel: 'ابدأ يومك بطاعة الله واحتسب الأجر',
        color: 'text-stone-600',
        badgeBg: 'bg-stone-100 border-stone-200',
        emoji: '🌱',
      },
    };
  }

  let completed = 0;
  habits.forEach((habit) => {
    const val = values[habit.id];
    if (habit.type === 'boolean') {
      if (val === true) {
        completed += 1;
      } else if (typeof val === 'number') {
        completed += Math.min(1, Math.max(0, val));
      }
    } else if (habit.type === 'counter') {
      const target = habit.targetCount || 1;
      const count = typeof val === 'number' ? val : 0;
      if (count >= target) {
        completed += 1;
      } else if (count > 0) {
        // partial credit proportional
        completed += Math.min(1, count / target);
      }
    }
  });

  const percentage = Math.round((completed / habits.length) * 100);

  let grade = {
    label: 'بداية مباركة',
    sublabel: 'استعن بالله وبادر بالخيرات',
    color: 'text-stone-700',
    badgeBg: 'bg-stone-100 text-stone-800 border-stone-300',
    emoji: '🌱',
  };

  if (percentage >= 90) {
    grade = {
      label: 'ممتاز وفضل عظيم',
      sublabel: 'ما شاء الله تبارك الله، ثبّتك الله وتقبّل منك صالح الأعمال',
      color: 'text-emerald-800',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      emoji: '🌟',
    };
  } else if (percentage >= 75) {
    grade = {
      label: 'جيد جداً ومجاهدة مباركة',
      sublabel: 'إنجاز رائع ومسار طيب، استمر على هذا الثبات',
      color: 'text-teal-800',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-300',
      emoji: '✨',
    };
  } else if (percentage >= 50) {
    grade = {
      label: 'مستوى طيب وبحاجة لزيادة',
      sublabel: 'جهد مشكور، استدرك ما فاتك بالنوافل والاستغفار',
      color: 'text-amber-800',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      emoji: '🌿',
    };
  } else if (percentage > 0) {
    grade = {
      label: 'يحتاج لمزيد من المجاهدة',
      sublabel: 'جدد العزم واستغفر ربك، فخير الخطائين التوابون',
      color: 'text-orange-800',
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-300',
      emoji: '⏳',
    };
  }

  return {
    completedCount: Math.round(completed * 10) / 10,
    totalCount: habits.length,
    percentage,
    grade,
  };
}

/**
 * Calculate user's consecutive day streak
 */
export function calculateStreak(records: Record<string, DayRecord>, habits: HabitItem[]): number {
  let streak = 0;
  let currentCheck = getTodayIsoString();

  // check if today has activity or check from yesterday
  const todayRecord = records[currentCheck];
  const todayComp = todayRecord ? calculateCompletion(habits, todayRecord.values) : null;

  if (todayComp && todayComp.percentage >= 40) {
    streak++;
    currentCheck = shiftDate(currentCheck, -1);
  } else {
    // maybe today isn't finished yet, start counting from yesterday
    currentCheck = shiftDate(currentCheck, -1);
  }

  while (streak < 365) {
    const rec = records[currentCheck];
    if (!rec) break;
    const comp = calculateCompletion(habits, rec.values);
    if (comp.percentage >= 40) {
      streak++;
      currentCheck = shiftDate(currentCheck, -1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get summaries for past 7 days for mini charts
 */
export function getWeeklySummaries(habits: HabitItem[], records: Record<string, DayRecord>): DaySummary[] {
  const result: DaySummary[] = [];
  const today = getTodayIsoString();

  for (let i = 6; i >= 0; i--) {
    const date = shiftDate(today, -i);
    const rec = records[date] || { values: {} };
    const comp = calculateCompletion(habits, rec.values);
    result.push({
      date,
      completedCount: comp.completedCount,
      totalCount: comp.totalCount,
      rate: comp.percentage,
    });
  }

  return result;
}

export interface WeeklyAnalyticsData {
  dailyTrend: Array<{
    date: string;
    dayName: string;
    shortDate: string;
    rate: number;
    completedCount: number;
    totalCount: number;
  }>;
  categoryPerformance: Array<{
    categoryId: string;
    name: string;
    rate: number;
    completed: number;
    total: number;
  }>;
  stats: {
    averageRate: number;
    bestDay: { dayName: string; rate: number } | null;
    totalCompletedDeeds: number;
    daysAboveTarget: number;
  };
}

export function getWeeklyDetailedAnalytics(
  habits: HabitItem[],
  records: Record<string, DayRecord>,
  targetRate = 80,
  daysCount = 7
): WeeklyAnalyticsData {
  const today = getTodayIsoString();
  const dailyTrend = [];
  let totalRateSum = 0;
  let totalDeedsSum = 0;
  let daysAboveTarget = 0;
  let bestDay: { dayName: string; rate: number } | null = null;

  const daysArabic = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  for (let i = daysCount - 1; i >= 0; i--) {
    const date = shiftDate(today, -i);
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const rawDayName = daysArabic[dateObj.getDay()];
    const dayName = i === 0 ? 'اليوم' : rawDayName;
    const shortDate = `${d}/${m}`;

    const rec = records[date] || { values: {} };
    const comp = calculateCompletion(habits, rec.values);

    dailyTrend.push({
      date,
      dayName,
      shortDate,
      rate: comp.percentage,
      completedCount: comp.completedCount,
      totalCount: comp.totalCount,
    });

    totalRateSum += comp.percentage;
    totalDeedsSum += comp.completedCount;

    if (comp.percentage >= targetRate) {
      daysAboveTarget++;
    }

    if (!bestDay || comp.percentage > bestDay.rate) {
      bestDay = { dayName, rate: comp.percentage };
    }
  }

  // Calculate category averages over the past days
  const categoryMap: Record<string, { name: string; completed: number; total: number }> = {
    prayers: { name: 'الفرائض', completed: 0, total: 0 },
    sunnah: { name: 'السنن', completed: 0, total: 0 },
    quran_dhikr: { name: 'القرآن والذكر', completed: 0, total: 0 },
    morals: { name: 'الأخلاق والبر', completed: 0, total: 0 },
    knowledge: { name: 'العلم والعمل', completed: 0, total: 0 },
  };

  for (let i = daysCount - 1; i >= 0; i--) {
    const date = shiftDate(today, -i);
    const rec = records[date] || { values: {} };

    habits.forEach((habit) => {
      const cat = categoryMap[habit.category];
      if (cat) {
        cat.total += 1;
        const val = rec.values[habit.id];
        if (habit.type === 'boolean' && val === true) {
          cat.completed += 1;
        } else if (habit.type === 'counter') {
          const count = typeof val === 'number' ? val : 0;
          const target = habit.targetCount || 1;
          if (count >= target) {
            cat.completed += 1;
          } else if (count > 0) {
            cat.completed += Math.min(1, count / target);
          }
        }
      }
    });
  }

  const categoryPerformance = Object.entries(categoryMap).map(([id, data]) => ({
    categoryId: id,
    name: data.name,
    rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    completed: Math.round(data.completed),
    total: data.total,
  }));

  const averageRate = Math.round(totalRateSum / daysCount);

  return {
    dailyTrend,
    categoryPerformance,
    stats: {
      averageRate,
      bestDay: bestDay && bestDay.rate > 0 ? bestDay : null,
      totalCompletedDeeds: Math.round(totalDeedsSum),
      daysAboveTarget,
    },
  };
}

