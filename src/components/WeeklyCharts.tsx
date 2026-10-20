import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Award,
  CheckCircle,
  Target,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { HabitItem, DayRecord } from '../types';
import { getWeeklyDetailedAnalytics } from '../utils/storage';

interface WeeklyChartsProps {
  habits: HabitItem[];
  records: Record<string, DayRecord>;
  targetRate?: number;
  onSelectDate?: (date: string) => void;
}

export const WeeklyCharts: React.FC<WeeklyChartsProps> = ({
  habits,
  records,
  targetRate = 80,
  onSelectDate,
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'categories'>('area');
  const [daysRange, setDaysRange] = useState<7 | 14>(7);

  const analytics = getWeeklyDetailedAnalytics(habits, records, targetRate, daysRange);
  const { dailyTrend, categoryPerformance, stats } = analytics;

  // Custom Islamic Arabic Tooltip for Daily Trend
  const CustomDailyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900/95 text-stone-100 p-3 rounded-xl shadow-xl border border-stone-700 text-xs font-cairo z-50 text-right backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-1.5 mb-1.5">
            <span className="font-bold text-amber-300 font-amiri text-sm">{data.dayName}</span>
            <span className="text-stone-400 text-[10px] tabular-nums">{data.date}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-stone-400">نسبة الإنجاز:</span>
              <span className="font-bold text-emerald-400 tabular-nums text-sm">{data.rate}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-stone-400">الطاعات المنجزة:</span>
              <span className="font-semibold text-stone-200 tabular-nums">
                {data.completedCount} من {data.totalCount}
              </span>
            </div>
            {data.rate >= targetRate && (
              <div className="text-[10px] text-emerald-400 font-medium pt-1 border-t border-stone-800/80 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>تم تحقيق الهدف المستهدف ({targetRate}%)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Categories
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900/95 text-stone-100 p-3 rounded-xl shadow-xl border border-stone-700 text-xs font-cairo z-50 text-right backdrop-blur-md">
          <span className="font-bold text-amber-300 block mb-1">{data.name}</span>
          <div className="flex items-center justify-between gap-4">
            <span className="text-stone-400">معدل الإنجاز:</span>
            <span className="font-bold text-emerald-400 tabular-nums text-sm">{data.rate}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <span className="text-stone-400">إجمالي المؤدى:</span>
            <span className="text-stone-200 tabular-nums">
              {data.completed} من أصل {data.total}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
      {/* Header with Title and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 dark:bg-emerald-700 text-amber-300 flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-cairo">
                مؤشرات التطور الأسبوعي
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Recharts
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-cairo mt-0.5">
              متابعة بيانية لنسبة إنجاز الطاعات وثباتك الإيماني بمرور الوقت
            </p>
          </div>
        </div>

        {/* View mode buttons & Days toggle */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Days Range Toggle */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              onClick={() => setDaysRange(7)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
                daysRange === 7
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              ٧ أيام
            </button>
            <button
              onClick={() => setDaysRange(14)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
                daysRange === 14
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              ١٤ يوماً
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors min-h-[32px] ${
                chartType === 'area'
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              منحنى التطور
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors min-h-[32px] ${
                chartType === 'bar'
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              أعمدة الأيام
            </button>
            <button
              onClick={() => setChartType('categories')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors min-h-[32px] ${
                chartType === 'categories'
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              إنجاز الأقسام
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Average Rate */}
        <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs mb-1 font-cairo">
            <span>متوسط الإنجاز الأسبوعي</span>
            <Target className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-cairo text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.averageRate}%
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-cairo">معدل الثبات</span>
          </div>
          <div className="mt-2 w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.averageRate)}%` }}
            />
          </div>
        </div>

        {/* Total Completed Deeds */}
        <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs mb-1 font-cairo">
            <span>إجمالي الطاعات المؤداة</span>
            <CheckCircle className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-cairo text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.totalCompletedDeeds}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-cairo">طاعة وعمل</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-cairo truncate">
            خلال آخر {daysRange} أيام مسجلة
          </p>
        </div>

        {/* Days Above Target */}
        <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs mb-1 font-cairo">
            <span>أيام تجاوز الهدف ({targetRate}%)</span>
            <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-cairo text-amber-900 dark:text-amber-300 tabular-nums">
              {stats.daysAboveTarget}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-cairo">من {daysRange} أيام</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-cairo truncate">
            {stats.daysAboveTarget > 0 ? 'استمرارية ممتازة وثبات' : 'اجعل غايتك بلوغ الهدف'}
          </p>
        </div>

        {/* Best Day */}
        <div className="bg-stone-50 dark:bg-stone-800/80 rounded-2xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs mb-1 font-cairo">
            <span>أفضل أيام الأسبوع</span>
            <Award className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-cairo text-stone-900 dark:text-stone-100 truncate">
              {stats.bestDay ? stats.bestDay.dayName : '—'}
            </span>
            {stats.bestDay && (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                ({stats.bestDay.rate}%)
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-cairo truncate">
            قمة المجاهدة والهمة العالية
          </p>
        </div>
      </div>

      {/* Main Interactive Recharts Canvas */}
      <div className="bg-stone-50/70 dark:bg-stone-800/60 rounded-2xl p-4 sm:p-6 border border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 font-cairo flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            {chartType === 'categories'
              ? 'توزيع الإنجاز بحسب أبواب الطاعات والعبادات'
              : `منحنى نسبة الإنجاز اليومية خلال آخر ${daysRange} أيام`}
          </span>

          {chartType !== 'categories' && (
            <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 font-cairo">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-500 inline-block" />
                نسبة الإنجاز
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 border-t-2 border-dashed border-amber-600 dark:border-amber-400 inline-block" />
                الهدف ({targetRate}%)
              </span>
            </div>
          )}
        </div>

        {/* Height container for Recharts */}
        <div className="w-full h-64 sm:h-72" dir="ltr">
          {chartType === 'area' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis
                  dataKey="dayName"
                  tick={{ fontSize: 11, fill: '#78716c', fontFamily: 'Cairo' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: '#a8a29e', fontFamily: 'Cairo' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                <ReferenceLine
                  y={targetRate}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#047857"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#emeraldGradient)"
                  dot={{ r: 4, fill: '#047857', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis
                  dataKey="dayName"
                  tick={{ fontSize: 11, fill: '#78716c', fontFamily: 'Cairo' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: '#a8a29e', fontFamily: 'Cairo' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                <ReferenceLine
                  y={targetRate}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Bar dataKey="rate" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {dailyTrend.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rate >= targetRate ? '#047857' : entry.rate >= 50 ? '#0d9488' : '#78716c'}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => onSelectDate && onSelectDate(entry.date)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryPerformance}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e5e4" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: '#a8a29e', fontFamily: 'Cairo' }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#44403c', fontFamily: 'Cairo', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip content={<CustomCategoryTooltip />} />
                <Bar dataKey="rate" radius={[0, 8, 8, 0]} barSize={22}>
                  {categoryPerformance.map((entry, index) => {
                    const colors = ['#047857', '#0f766e', '#b45309', '#be123c', '#4338ca'];
                    return <Cell key={`cat-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bottom Chart Footer Tip */}
        <div className="mt-4 pt-3 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-cairo gap-2">
          <p className="flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              نصيحة الاستدراك: حافظ على الفرائض أولاً، ثم ثبت ورداً يومياً من القرآن والاستغفار.
            </span>
          </p>
          <span className="text-[11px] text-stone-400">
            يمكنك الضغط على أي عمود للانتقال لجدول ذلك اليوم
          </span>
        </div>
      </div>
    </section>
  );
};
