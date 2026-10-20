import React from 'react';
import { Sun, Moon, Globe, Clock, Sparkles, Bell } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  currentNav: 'home' | 'habits' | 'analytics' | 'settings';
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onChangeNav: (nav: 'home' | 'habits' | 'analytics' | 'settings') => void;
  onOpenReport: () => void;
  onOpenProfile: () => void;
  onOpenTasbeeh: () => void;
  onOpenFocusTimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentNav,
  isDarkMode,
  onToggleDarkMode,
  onChangeNav,
  onOpenReport,
  onOpenProfile,
  onOpenTasbeeh,
  onOpenFocusTimer,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Right Brand Lockup matching screenshot */}
        <div
          onClick={() => onChangeNav('home')}
          className="flex items-center gap-3 cursor-pointer shrink-0 select-none"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-900 dark:bg-emerald-800 text-white flex items-center justify-center font-amiri font-bold text-lg shadow-xs">
            م
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-cairo leading-none">
              محاسبة النفس
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-cairo hidden sm:block mt-0.5">
              زاد المؤمن اليومي للمحاسبة والاستقامة
            </p>
          </div>
        </div>

        {/* Center Nav Links matching screenshot */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium font-cairo">
          <button
            onClick={() => onChangeNav('home')}
            className={`transition-colors pb-0.5 ${
              currentNav === 'home'
                ? 'text-emerald-800 dark:text-emerald-400 font-bold border-b-2 border-emerald-800 dark:border-emerald-400'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => onChangeNav('habits')}
            className={`transition-colors pb-0.5 ${
              currentNav === 'habits'
                ? 'text-emerald-800 dark:text-emerald-400 font-bold border-b-2 border-emerald-800 dark:border-emerald-400'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            الأعمال
          </button>
          <button
            onClick={() => onChangeNav('analytics')}
            className={`transition-colors pb-0.5 ${
              currentNav === 'analytics'
                ? 'text-emerald-800 dark:text-emerald-400 font-bold border-b-2 border-emerald-800 dark:border-emerald-400'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            التقارير
          </button>
          <button
            onClick={() => onOpenProfile()}
            className={`transition-colors pb-0.5 ${
              currentNav === 'settings'
                ? 'text-emerald-800 dark:text-emerald-400 font-bold border-b-2 border-emerald-800 dark:border-emerald-400'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            الإعدادات
          </button>
        </nav>

        {/* Left Utilities (Language, Sun/Moon, Focus Timer, Tasbeeh) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Focus Timer Button */}
          <button
            onClick={onOpenFocusTimer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors min-h-[36px]"
            title="مؤقت التركيز للورد القرآني والأذكار"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
            <span className="hidden sm:inline">مؤقت التركيز</span>
          </button>

          {/* Tasbeeh */}
          <button
            onClick={onOpenTasbeeh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors min-h-[36px]"
            title="المسبحة الإلكترونية"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">المسبحة</span>
          </button>

          {/* Daily Reminder Bell */}
          <button
            onClick={onOpenProfile}
            className={`relative p-2 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
              profile.reminderEnabled
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={
              profile.reminderEnabled
                ? `التذكير اليومي مفعل: ${profile.reminderTime || '21:00'}`
                : 'تفعيل إشعارات التذكير اليومي بمحاسبة النفس'
            }
            aria-label="إشعارات التذكير اليومي"
          >
            <Bell className="w-4 h-4" />
            {profile.reminderEnabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white dark:ring-stone-900" />
            )}
          </button>

          {/* AR Language Badge from screenshot */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 min-h-[36px] select-none">
            <span>AR</span>
            <Globe className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-amber-600 dark:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
            aria-label="تبديل الوضع الليلي"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
