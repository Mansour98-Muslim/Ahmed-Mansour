import React, { useState } from 'react';
import {
  Search,
  CheckCheck,
  RotateCcw,
  Compass,
  Sun,
  BookOpen,
  Heart,
  GraduationCap,
  Sparkles,
  Filter,
  Moon,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import {
  HabitCategory,
  HabitItem,
  HabitValues,
  DayRecord,
  PrayerDetail,
  QiyamTarget,
  CharityGoal,
} from '../types';
import { CATEGORIES } from '../data/defaultHabits';
import { HabitCard } from './HabitCard';
import { PrayerCard, PRAYERS_CONFIG } from './PrayerCard';
import { QiyamCard } from './QiyamCard';
import { AdhkarCard } from './AdhkarCard';
import { MoralsCard } from './MoralsCard';
import { CharityCard } from './CharityCard';
import { MORNING_ADHKAR, EVENING_ADHKAR } from '../data/adhkarData';
import { speakArabicPhrase } from '../utils/audio';

interface HabitListProps {
  habits: HabitItem[];
  record: DayRecord;
  values: HabitValues;
  onChangeHabit: (habitId: string, newValue: boolean | number) => void;
  onDeleteCustomHabit: (habitId: string) => void;
  onOpenTasbeehWithHabit: (habit: HabitItem) => void;
  activeCategory?: HabitCategory | 'all';
  onCategoryChange?: (category: HabitCategory | 'all') => void;
  onUpdatePrayerDetail: (prayerId: string, detail: PrayerDetail) => void;
  onUpdateQiyamData: (updated: QiyamTarget) => void;
  onUpdateAdhkarProgress: (type: 'morning' | 'evening', dhikrId: string, count: number) => void;
  onUpdateAdhkarCustomTarget: (habitId: string, target: number) => void;
  onSaveMoralObstacleNote: (habitId: string, note: string) => void;
  onUpdateCharityGoal: (goalId: string, current: number) => void;
  onAddCharityGoal: (goal: CharityGoal) => void;
  onDeleteCharityGoal: (goalId: string) => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  record,
  values,
  onChangeHabit,
  onDeleteCustomHabit,
  onOpenTasbeehWithHabit,
  activeCategory,
  onCategoryChange,
  onUpdatePrayerDetail,
  onUpdateQiyamData,
  onUpdateAdhkarProgress,
  onUpdateAdhkarCustomTarget,
  onSaveMoralObstacleNote,
  onUpdateCharityGoal,
  onAddCharityGoal,
  onDeleteCharityGoal,
}) => {
  const [internalCategory, setInternalCategory] = useState<HabitCategory | 'all'>('all');
  const selectedCategory = activeCategory !== undefined ? activeCategory : internalCategory;

  const handleCategoryClick = (cat: HabitCategory | 'all') => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'prayers':
        return <Compass className="w-4 h-4" />;
      case 'sunnah':
        return <Sun className="w-4 h-4" />;
      case 'quran_dhikr':
        return <BookOpen className="w-4 h-4" />;
      case 'morals':
        return <Heart className="w-4 h-4" />;
      case 'knowledge':
        return <GraduationCap className="w-4 h-4" />;
      case 'custom':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  // Safe records data
  const prayersDetail = record.prayersDetail || {};
  const qiyamData = record.qiyamData || { targetRakats: 8, completedRakats: 0, witrCompleted: false };
  const adhkarProgress = record.adhkarProgress || {};
  const adhkarTargets = record.adhkarCustomTargets || {};
  const moralNotes = record.moralObstacleNotes || {};
  const charityGoals = record.charityGoals || [];

  // Filter habits for search
  const matchesSearch = (title: string, desc?: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || (desc && desc.toLowerCase().includes(q));
  };

  // Other habits filtering
  const knowledgeHabits = habits.filter((h) => h.category === 'knowledge' && matchesSearch(h.title, h.description));
  const customHabits = habits.filter((h) => h.category === 'custom' && matchesSearch(h.title, h.description));

  // Duha & other sunnahs
  const otherSunnahHabits = habits.filter(
    (h) => h.category === 'sunnah' && h.id !== 'qiyam_witr' && h.id !== 'sunnah_fajr' && h.id !== 'sunnah_rawatib' && matchesSearch(h.title, h.description)
  );

  // Other quran habits like pages
  const quranPagesHabit = habits.find((h) => h.id === 'quran_pages');
  const sleepAdhkarHabit = habits.find((h) => h.id === 'sleep_adhkar');

  // Moral habits
  const moralHabits = habits.filter(
    (h) => h.category === 'morals' && h.id !== 'daily_charity' && matchesSearch(h.title, h.description)
  );

  // Mark all visible as done/reset
  const markAllVisible = (done: boolean) => {
    // Prayers
    PRAYERS_CONFIG.forEach((p) => {
      onUpdatePrayerDetail(p.id, {
        fard: done,
        sunnahQabliyah: p.hasQabliyah ? done : false,
        sunnahBadiyah: p.hasBadiyah ? done : false,
      });
    });

    // Qiyam
    onUpdateQiyamData({
      ...qiyamData,
      completedRakats: done ? (qiyamData.targetRakats || 8) : 0,
      witrCompleted: done,
    });

    // Adhkar
    MORNING_ADHKAR.forEach((m) => onUpdateAdhkarProgress('morning', m.id, done ? m.count : 0));
    EVENING_ADHKAR.forEach((e) => onUpdateAdhkarProgress('evening', e.id, done ? e.count : 0));

    // Counter adhkar & other habits
    habits.forEach((h) => {
      if (h.type === 'boolean') {
        onChangeHabit(h.id, done);
      } else if (h.type === 'counter') {
        onChangeHabit(h.id, done ? (h.targetCount || 100) : 0);
      }
    });

    if (done) {
      speakArabicPhrase('الحمد لله');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Category Filter Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 transition-colors">
        {/* Top search & bulk actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن صلاة، سنة، ورد ذكر، أو خلق..."
              className="w-full pr-10 pl-4 py-2 text-sm bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-xl focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                مسح
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => markAllVisible(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap min-h-[36px]"
              title="تحديد كل المعروض كمنجز"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>إتمام الكل</span>
            </button>

            <button
              onClick={() => markAllVisible(false)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap min-h-[36px]"
              title="إعادة تعيين المعروض"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[38px] ${
              selectedCategory === 'all'
                ? 'bg-stone-900 dark:bg-emerald-800 text-white shadow-xs font-semibold'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            <span>جميع الطاعات</span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[38px] ${
                  isSelected
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs font-semibold'
                    : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: الصلوات المفروضة والسنن المرتبطة بها */}
      {(selectedCategory === 'all' || selectedCategory === 'prayers') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-cairo">
                الصلوات المفروضة والسنن المرتبطة بها
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-cairo hidden sm:inline">
              السنن الرواتب مرتبطة بكل فريضة مع نسبة إنجاز
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {PRAYERS_CONFIG.filter((p) => matchesSearch(p.name, p.fardDescription)).map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                detail={prayersDetail[prayer.id] || { fard: false }}
                onChangeDetail={onUpdatePrayerDetail}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: السنن والنوافل وقيام الليل */}
      {(selectedCategory === 'all' || selectedCategory === 'sunnah') && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-cairo">
                السنن والنوافل وقيام الليل
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-cairo hidden sm:inline">
              قيام الليل بأجزاء القرآن والوتر وصلاة الضحى
            </span>
          </div>

          {/* Qiyam Card with 30 Juz Surahs and Ayahs inputs */}
          <QiyamCard data={qiyamData} onChange={onUpdateQiyamData} />

          {/* Other Sunnahs (Duha, etc.) */}
          {otherSunnahHabits.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {otherSunnahHabits.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  value={values[h.id]}
                  onChange={onChangeHabit}
                  onOpenTasbeehWithHabit={onOpenTasbeehWithHabit}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: القرآن الكريم والأذكار */}
      {(selectedCategory === 'all' || selectedCategory === 'quran_dhikr') && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-cairo">
                القرآن الكريم والأذكار اليومية
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-cairo hidden sm:inline">
              أذكار الصباح والمساء مفصلة وأذكار التسبيح والاستغفار
            </span>
          </div>

          {/* 1. Morning Adhkar Card */}
          <AdhkarCard
            type="morning"
            title="أذكار الصباح كاملة"
            description="حصن المسلم ووقاية النهار من بعد الفجر حتى الإشراق والضحى"
            detailedProgress={adhkarProgress['morning'] || {}}
            onUpdateDetailedProgress={(dhikrId, count) => onUpdateAdhkarProgress('morning', dhikrId, count)}
          />

          {/* 2. Evening Adhkar Card */}
          <AdhkarCard
            type="evening"
            title="أذكار المساء كاملة"
            description="حصن المسلم وسكينة الليل من بعد العصر حتى غروب الشمس والليل"
            detailedProgress={adhkarProgress['evening'] || {}}
            onUpdateDetailedProgress={(dhikrId, count) => onUpdateAdhkarProgress('evening', dhikrId, count)}
          />

          {/* 3. Counter Adhkars (Istighfar, Salawat, Tasbeeh) with customizable targets */}
          <div className="space-y-3">
            <AdhkarCard
              type="counter"
              title="الاستغفار والتوبة النصوح"
              description="أستغفر الله العظيم وأتوب إليه من كل ذنب وتقصير"
              reward="«من لزم الاستغفار جعل الله له من كل هم فرجا، ومن كل ضيق مخرجا»"
              count={typeof values['istighfar_100'] === 'number' ? (values['istighfar_100'] as number) : 0}
              customTarget={adhkarTargets['istighfar_100'] || 100}
              onUpdateCount={(c) => onChangeHabit('istighfar_100', c)}
              onUpdateCustomTarget={(t) => onUpdateAdhkarCustomTarget('istighfar_100', t)}
              onOpenTasbeeh={() => {
                const h = habits.find((item) => item.id === 'istighfar_100');
                if (h) onOpenTasbeehWithHabit(h);
              }}
            />

            <AdhkarCard
              type="counter"
              title="الصلاة والسلام على رسول الله ﷺ"
              description="اللهم صل وسلم وبارك على سيدنا محمد وعلى آله وصحبه"
              reward="«مَن صلَّى عليَّ صلاةً صلَّى اللَّهُ عليهِ بِها عَشرًا» ويُكفى همك ويُغفر ذنبك"
              count={typeof values['salawat_100'] === 'number' ? (values['salawat_100'] as number) : 0}
              customTarget={adhkarTargets['salawat_100'] || 100}
              onUpdateCount={(c) => onChangeHabit('salawat_100', c)}
              onUpdateCustomTarget={(t) => onUpdateAdhkarCustomTarget('salawat_100', t)}
              onOpenTasbeeh={() => {
                const h = habits.find((item) => item.id === 'salawat_100');
                if (h) onOpenTasbeehWithHabit(h);
              }}
            />

            <AdhkarCard
              type="counter"
              title="الباقيات الصالحات (التسبيح والتحميد والتهليل)"
              description="سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر، ولا حول ولا قوة إلا بالله"
              reward="أحب الكلام إلى الله، وغراس الجنة ومكفرات الخطايا"
              count={typeof values['tasbeeh_general'] === 'number' ? (values['tasbeeh_general'] as number) : 0}
              customTarget={adhkarTargets['tasbeeh_general'] || 100}
              onUpdateCount={(c) => onChangeHabit('tasbeeh_general', c)}
              onUpdateCustomTarget={(t) => onUpdateAdhkarCustomTarget('tasbeeh_general', t)}
              onOpenTasbeeh={() => {
                const h = habits.find((item) => item.id === 'tasbeeh_general');
                if (h) onOpenTasbeehWithHabit(h);
              }}
            />
          </div>

          {/* Quran Pages & Sleep Adhkar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {quranPagesHabit && (
              <HabitCard
                habit={quranPagesHabit}
                value={values[quranPagesHabit.id]}
                onChange={onChangeHabit}
                onOpenTasbeehWithHabit={onOpenTasbeehWithHabit}
              />
            )}
            {sleepAdhkarHabit && (
              <HabitCard
                habit={sleepAdhkarHabit}
                value={values[sleepAdhkarHabit.id]}
                onChange={onChangeHabit}
                onOpenTasbeehWithHabit={onOpenTasbeehWithHabit}
              />
            )}
          </div>
        </section>
      )}

      {/* SECTION 4: الأخلاق والمعاملات والبر والصدقة */}
      {(selectedCategory === 'all' || selectedCategory === 'morals') && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-700 dark:text-rose-400" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-cairo">
                الأخلاق والمعاملات وحفظ الجوارح
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-cairo hidden sm:inline">
              تسجيل المواقف والعوائق مع حفظ الملحوظة وإشعار «جزاك الله خيراً ونفع بك»
            </span>
          </div>

          {/* Morals Cards with obstacle notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {moralHabits.map((habit) => (
              <MoralsCard
                key={habit.id}
                habit={habit}
                completed={Boolean(values[habit.id])}
                obstacleNote={moralNotes[habit.id] || ''}
                onToggleComplete={(id, done) => onChangeHabit(id, done)}
                onSaveObstacleNote={onSaveMoralObstacleNote}
              />
            ))}
          </div>

          {/* Charity Card: البر والصدقة مع وضع أهداف ونسبة إنجاز */}
          <div className="mt-4">
            <CharityCard
              goals={charityGoals}
              onUpdateGoal={onUpdateCharityGoal}
              onAddGoal={onAddCharityGoal}
              onDeleteGoal={onDeleteCharityGoal}
            />
          </div>
        </section>
      )}

      {/* SECTION 5: طلب العلم والعمل الصالح والباقي */}
      {(selectedCategory === 'all' || selectedCategory === 'knowledge') && knowledgeHabits.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-cairo">
              طلب العلم والعمل الصالح
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {knowledgeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                value={values[habit.id]}
                onChange={onChangeHabit}
                onOpenTasbeehWithHabit={onOpenTasbeehWithHabit}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: الأهداف المخصصة الإضافية */}
      {(selectedCategory === 'all' || selectedCategory === 'custom') && customHabits.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-cairo">
              أهدافي الخاصة المضافة
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                value={values[habit.id]}
                onChange={onChangeHabit}
                onDeleteCustom={onDeleteCustomHabit}
                onOpenTasbeehWithHabit={onOpenTasbeehWithHabit}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
