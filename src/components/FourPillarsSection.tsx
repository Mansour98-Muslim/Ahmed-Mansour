import React from 'react';
import { Clock, Sparkles, BookOpen, Heart } from 'lucide-react';
import { HabitItem, HabitValues, HabitCategory } from '../types';

interface FourPillarsSectionProps {
  habits: HabitItem[];
  values: HabitValues;
  selectedCategory: HabitCategory | 'all';
  onSelectCategory: (category: HabitCategory | 'all') => void;
  onScrollToHabits: () => void;
}

export const FourPillarsSection: React.FC<FourPillarsSectionProps> = ({
  habits,
  values,
  selectedCategory,
  onSelectCategory,
  onScrollToHabits,
}) => {
  // Helper to calculate progress for each pillar
  const getPillarStats = (categoryId: HabitCategory) => {
    const list = habits.filter((h) => h.category === categoryId);
    let done = 0;
    list.forEach((h) => {
      const v = values[h.id];
      if (h.type === 'boolean' && v === true) done++;
      if (h.type === 'counter') {
        const count = typeof v === 'number' ? v : 0;
        const target = h.targetCount || 1;
        if (count >= target) done++;
        else if (count > 0) done += Math.min(1, count / target);
      }
    });
    const total = list.length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      done: Math.round(done * 10) / 10,
      total,
      rate,
    };
  };

  const pillars = [
    {
      id: 'prayers' as HabitCategory,
      title: 'الفرائض والصلوات',
      description: 'الصلوات الخمس في أوقاتها، جماعة للرجال وخشوع وتدبر.',
      icon: Clock,
      iconColor: 'text-emerald-800 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400',
      stats: getPillarStats('prayers'),
    },
    {
      id: 'sunnah' as HabitCategory,
      title: 'السنن والنوافل',
      description: 'السنن الرواتب، صلاة الضحى، قيام الليل، والوتر المبارك.',
      icon: Sparkles,
      iconColor: 'text-teal-800 dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-400',
      stats: getPillarStats('sunnah'),
    },
    {
      id: 'quran_dhikr' as HabitCategory,
      title: 'الأذكار والقرآن',
      description: 'أذكار الصباح والمساء، ورد التلاوة، والاستغفار والصلاة على النبي ﷺ.',
      icon: BookOpen,
      iconColor: 'text-amber-800 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400',
      stats: getPillarStats('quran_dhikr'),
    },
    {
      id: 'morals' as HabitCategory,
      title: 'الأخلاق وحفظ الجوارح',
      description: 'حفظ اللسان والبصر، بر الوالدين، الصدقة، وسلامة الصدر.',
      icon: Heart,
      iconColor: 'text-rose-800 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400',
      stats: getPillarStats('morals'),
    },
  ];

  const handleCardClick = (catId: HabitCategory) => {
    onSelectCategory(catId);
    onScrollToHabits();
  };

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-cairo">
          تفصيل الأقسام الأربعة
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-cairo mt-0.5">
          يشمل أركان المحاسبة الأربعة: الفرائض، السنن، الأذكار والقرآن، والأخلاق والمعاملات.
        </p>
      </div>

      {/* 2x2 Pillars Grid matching the screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isSelected = selectedCategory === pillar.id;

          return (
            <div
              key={pillar.id}
              onClick={() => handleCardClick(pillar.id)}
              className={`group bg-white dark:bg-stone-900 rounded-2xl p-5 border cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden ${
                isSelected
                  ? 'border-emerald-700 dark:border-emerald-500 ring-2 ring-emerald-700/20 dark:ring-emerald-500/20 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-2xs'
              }`}
            >
              {/* Card Top: Metric on left, Icon on right */}
              <div className="flex items-start justify-between gap-3">
                {/* Metric */}
                <div className="text-left">
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-200 font-cairo tabular-nums">
                    {pillar.stats.total} / {pillar.stats.done}
                  </div>
                  <div className="text-xs text-stone-400 dark:text-stone-500 font-medium font-cairo tabular-nums">
                    {pillar.stats.rate}%
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pillar.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-3">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo mt-1 line-clamp-2 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              {/* Progress mini-bar at bottom */}
              <div className="mt-4 w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-700 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pillar.stats.rate)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
