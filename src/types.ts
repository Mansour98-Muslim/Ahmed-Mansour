/**
 * Data structures for Islamic Daily Self-Accounting (محاسبة النفس)
 */

export type HabitCategory =
  | 'prayers'       // الصلوات المفروضة والسنن المرتبطة بها
  | 'sunnah'        // النوافل وقيام الليل
  | 'quran_dhikr'   // القرآن والذكر
  | 'morals'        // الأخلاق وحفظ الجوارح
  | 'charity'       // البر والصدقة
  | 'knowledge'     // طلب العلم والعمل الصالح
  | 'custom';       // بنود مخصصة

export interface CategoryInfo {
  id: HabitCategory;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
}

export type HabitType = 'boolean' | 'counter';

export interface HabitItem {
  id: string;
  title: string;
  category: HabitCategory;
  description?: string;
  reward?: string;        // فضل العمل أو دليل من السنة
  type: HabitType;
  targetCount?: number;   // e.g. 100 for Istighfar, 4 for pages of Quran
  unit?: string;          // e.g. صفحة، ركعة، تسبيحة، مرة
  isCustom?: boolean;
}

export type HabitValues = Record<string, boolean | number>;

export interface PrayerDetail {
  fard: boolean;
  sunnahQabliyah?: boolean;
  sunnahBadiyah?: boolean;
}

export interface QiyamTarget {
  targetRakats: number;
  completedRakats: number;
  surahFrom?: number;
  surahTo?: number;
  ayahFrom?: number;
  ayahTo?: number;
  witrCompleted?: boolean;
}

export interface CharityGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface DayRecord {
  date: string; // ISO format: YYYY-MM-DD
  values: HabitValues;
  notes: string;
  tomorrowIntention: string;
  lastUpdated: string;
  // Specific enhanced domains requested:
  prayersDetail?: Record<string, PrayerDetail>;
  qiyamData?: QiyamTarget;
  moralObstacleNotes?: Record<string, string>;
  charityGoals?: CharityGoal[];
  adhkarProgress?: Record<string, Record<string, number>>;
  adhkarCustomTargets?: Record<string, number>;
}

export interface UserProfile {
  name: string;
  targetRate: number; // e.g. 80%
  joinDate: string;
  reminderEnabled: boolean;
  reminderTime?: string; // e.g. "21:00" (موعد التذكير اليومي)
  darkMode?: boolean;
}

export interface DaySummary {
  date: string;
  completedCount: number;
  totalCount: number;
  rate: number;
}
