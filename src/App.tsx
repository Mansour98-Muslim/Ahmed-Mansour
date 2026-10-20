/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FourPillarsSection } from './components/FourPillarsSection';
import { DateNavigator } from './components/DateNavigator';
import { HabitList } from './components/HabitList';
import { WeeklyCharts } from './components/WeeklyCharts';
import { ReflectionSection } from './components/ReflectionSection';
import { MotivationalQuote } from './components/MotivationalQuote';
import { WelcomeModal } from './components/WelcomeModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { DailyReportModal } from './components/DailyReportModal';
import { DigitalTasbeehModal } from './components/DigitalTasbeehModal';
import { AddHabitModal } from './components/AddHabitModal';
import { UserProfileModal } from './components/UserProfileModal';
import {
  getTodayIsoString,
} from './utils/dateUtils';
import {
  getStoredProfile,
  saveStoredProfile,
  getAllHabits,
  saveStoredCustomHabits,
  getStoredCustomHabits,
  getStoredRecords,
  saveStoredRecords,
  getRecordForDate,
  calculateCompletion,
  calculateStreak,
} from './utils/storage';
import { HabitItem, UserProfile, HabitCategory, DayRecord, PrayerDetail, QiyamTarget, CharityGoal } from './types';
import { MORNING_ADHKAR, EVENING_ADHKAR } from './data/adhkarData';
import { DEFAULT_CHARITY_PRESETS } from './components/CharityCard';
import { checkAndTriggerDailyReminder } from './utils/notifications';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoString());
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = getStoredProfile();
    // Default name fallback to 'ahmed mansour' as seen in the screenshot if user hasn't modified it
    if (!stored || stored.name === 'عبد الله') {
      return { ...stored, name: 'ahmed mansour' };
    }
    return stored;
  });
  const [habits, setHabits] = useState<HabitItem[]>(getAllHabits);
  const [records, setRecords] = useState(getStoredRecords);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('muhasaba_theme');
      if (savedTheme) return savedTheme === 'dark';
      const stored = getStoredProfile();
      if (typeof stored?.darkMode === 'boolean') return stored.darkMode;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('muhasaba_theme', isDarkMode ? 'dark' : 'light');
    } catch {}
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Daily browser notification scheduler for self-accounting reminder
  useEffect(() => {
    if (!profile.reminderEnabled) return;

    // Run immediate check
    checkAndTriggerDailyReminder(profile);

    // Periodically check every 30 seconds
    const timer = setInterval(() => {
      checkAndTriggerDailyReminder(profile);
    }, 30000);

    return () => clearInterval(timer);
  }, [profile]);

  // Active top navigation tab
  const [currentNav, setCurrentNav] = useState<'home' | 'habits' | 'analytics' | 'settings'>('home');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');

  // Modals
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    try {
      const today = getTodayIsoString();
      const dismissed = localStorage.getItem(`muhasaba_welcome_dismissed_${today}`);
      return dismissed !== 'true';
    } catch {
      return true;
    }
  });

  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTasbeehOpen, setIsTasbeehOpen] = useState(false);
  const [tasbeehHabit, setTasbeehHabit] = useState<HabitItem | null>(null);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Ref to checklist for smooth scrolling
  const checklistRef = useRef<HTMLDivElement>(null);

  const scrollToChecklist = () => {
    if (checklistRef.current) {
      checklistRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Save profile changes
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    if (typeof newProfile.darkMode === 'boolean' && newProfile.darkMode !== isDarkMode) {
      setIsDarkMode(newProfile.darkMode);
    }
  };

  // Get current record for selected date
  const currentRecord = records[selectedDate] || getRecordForDate(selectedDate);

  // Handle value toggling
  const handleHabitChange = (habitId: string, newValue: boolean | number) => {
    const updatedValues = {
      ...currentRecord.values,
      [habitId]: newValue,
    };
    const updatedRecord = {
      ...currentRecord,
      date: selectedDate,
      values: updatedValues,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };

    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // 1. Handle Prayer Detail (Fard + Sunnah Qabliyah / Badiyah) and sync to overall percentage
  const handleUpdatePrayerDetail = (prayerId: string, updated: PrayerDetail) => {
    const currentPrayers = currentRecord.prayersDetail || {};
    const newPrayers = { ...currentPrayers, [prayerId]: updated };

    // Calculate score for this prayer and sync to values
    const newValues = { ...currentRecord.values };
    
    // Fajr (Fard + 1 Qabliyah)
    if (prayerId === 'fajr') {
      const parts = (updated.fard ? 1 : 0) + (updated.sunnahQabliyah ? 1 : 0);
      newValues['fajr_prayer'] = parts === 2 ? true : parts > 0 ? parts / 2 : false;
      newValues['sunnah_fajr'] = Boolean(updated.sunnahQabliyah);
    }
    // Dhuhr (Fard + Qabliyah + Badiyah = 3)
    else if (prayerId === 'dhuhr') {
      const parts = (updated.fard ? 1 : 0) + (updated.sunnahQabliyah ? 1 : 0) + (updated.sunnahBadiyah ? 1 : 0);
      newValues['dhuhr_prayer'] = parts === 3 ? true : parts > 0 ? parts / 3 : false;
    }
    // Asr (Fard + Qabliyah = 2)
    else if (prayerId === 'asr') {
      const parts = (updated.fard ? 1 : 0) + (updated.sunnahQabliyah ? 1 : 0);
      newValues['asr_prayer'] = parts === 2 ? true : parts > 0 ? parts / 2 : false;
    }
    // Maghrib (Fard + Badiyah = 2)
    else if (prayerId === 'maghrib') {
      const parts = (updated.fard ? 1 : 0) + (updated.sunnahBadiyah ? 1 : 0);
      newValues['maghrib_prayer'] = parts === 2 ? true : parts > 0 ? parts / 2 : false;
    }
    // Isha (Fard + Badiyah = 2)
    else if (prayerId === 'isha') {
      const parts = (updated.fard ? 1 : 0) + (updated.sunnahBadiyah ? 1 : 0);
      newValues['isha_prayer'] = parts === 2 ? true : parts > 0 ? parts / 2 : false;
    }

    // Also sync sunnah_rawatib (if Dhuhr, Maghrib, Isha sunnahs are done)
    const dhuhrDetail = newPrayers['dhuhr'] || { fard: false };
    const maghribDetail = newPrayers['maghrib'] || { fard: false };
    const ishaDetail = newPrayers['isha'] || { fard: false };
    const rawatibDone = Boolean(dhuhrDetail.sunnahQabliyah || dhuhrDetail.sunnahBadiyah || maghribDetail.sunnahBadiyah || ishaDetail.sunnahBadiyah);
    newValues['sunnah_rawatib'] = rawatibDone;

    const updatedRecord: DayRecord = {
      ...currentRecord,
      date: selectedDate,
      prayersDetail: newPrayers,
      values: newValues,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // 2. Handle Qiyam Data (target, completed rakats, witr, surahs, ayahs)
  const handleUpdateQiyamData = (updated: QiyamTarget) => {
    const target = updated.targetRakats || 8;
    const completed = updated.completedRakats || 0;
    const witrDone = Boolean(updated.witrCompleted);

    const totalTarget = target + 1; // +1 for witr
    const totalDone = Math.min(target, completed) + (witrDone ? 1 : 0);
    const score = Math.min(1, totalDone / totalTarget);

    const newValues = {
      ...currentRecord.values,
      qiyam_witr: score >= 1 ? true : score > 0 ? score : false,
    };

    const updatedRecord: DayRecord = {
      ...currentRecord,
      date: selectedDate,
      qiyamData: updated,
      values: newValues,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // 3. Handle Morning / Evening Adhkar progress
  const handleUpdateAdhkarProgress = (type: 'morning' | 'evening', dhikrId: string, count: number) => {
    const currentProgress = currentRecord.adhkarProgress || {};
    const typeProgress = { ...(currentProgress[type] || {}), [dhikrId]: count };
    const newProgress = { ...currentProgress, [type]: typeProgress };

    const list = type === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR;
    let completedItems = 0;
    list.forEach((item) => {
      if ((typeProgress[item.id] || 0) >= item.count) {
        completedItems++;
      }
    });

    const score = list.length > 0 ? completedItems / list.length : 0;
    const habitId = type === 'morning' ? 'morning_adhkar' : 'evening_adhkar';

    const newValues = {
      ...currentRecord.values,
      [habitId]: score >= 1 ? true : score > 0 ? score : false,
    };

    const updatedRecord: DayRecord = {
      ...currentRecord,
      date: selectedDate,
      adhkarProgress: newProgress,
      values: newValues,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // 4. Handle Adhkar Custom Targets (e.g. Istighfar 100/200/500/1000)
  const handleUpdateAdhkarCustomTarget = (habitId: string, target: number) => {
    const currentTargets = currentRecord.adhkarCustomTargets || {};
    const newTargets = { ...currentTargets, [habitId]: target };

    const updatedRecord: DayRecord = {
      ...currentRecord,
      date: selectedDate,
      adhkarCustomTargets: newTargets,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // 5. Handle Moral Obstacle Note Save
  const handleSaveMoralObstacleNote = (habitId: string, note: string) => {
    const currentNotes = currentRecord.moralObstacleNotes || {};
    const updatedNotes = { ...currentNotes, [habitId]: note };

    const updatedRecord: DayRecord = {
      ...currentRecord,
      date: selectedDate,
      moralObstacleNotes: updatedNotes,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // 6. Handle Charity Goals
  const handleUpdateCharityGoal = (goalId: string, current: number) => {
    const currentGoals = currentRecord.charityGoals && currentRecord.charityGoals.length > 0
      ? currentRecord.charityGoals
      : DEFAULT_CHARITY_PRESETS;
    const updatedGoals = currentGoals.map((g) => (g.id === goalId ? { ...g, current } : g));

    let completedTasks = 0;
    updatedGoals.forEach((g) => {
      if (g.current >= g.target) completedTasks++;
      else if (g.current > 0) completedTasks += g.current / g.target;
    });
    const score = updatedGoals.length > 0 ? completedTasks / updatedGoals.length : 0;

    const newValues = {
      ...currentRecord.values,
      daily_charity: score >= 1 ? true : score > 0 ? score : false,
    };

    const updatedRecord: DayRecord = {
      ...currentRecord,
      date: selectedDate,
      charityGoals: updatedGoals,
      values: newValues,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  const handleAddCharityGoal = (goal: CharityGoal) => {
    const currentGoals = currentRecord.charityGoals && currentRecord.charityGoals.length > 0
      ? currentRecord.charityGoals
      : DEFAULT_CHARITY_PRESETS;
    const updatedGoals = [...currentGoals, goal];

    const updatedRecord: DayRecord = {
      ...currentRecord,
      date: selectedDate,
      charityGoals: updatedGoals,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  const handleDeleteCharityGoal = (goalId: string) => {
    const currentGoals = currentRecord.charityGoals && currentRecord.charityGoals.length > 0
      ? currentRecord.charityGoals
      : DEFAULT_CHARITY_PRESETS;
    const updatedGoals = currentGoals.filter((g) => g.id !== goalId);

    const updatedRecord: DayRecord = {
      ...currentRecord,
      date: selectedDate,
      charityGoals: updatedGoals,
      lastUpdated: new Date().toISOString(),
    };

    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // Handle notes
  const handleNotesChange = (notes: string) => {
    const updatedRecord = {
      ...currentRecord,
      date: selectedDate,
      notes,
      lastUpdated: new Date().toISOString(),
    };
    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // Handle tomorrow's intention
  const handleTomorrowIntentionChange = (tomorrowIntention: string) => {
    const updatedRecord = {
      ...currentRecord,
      date: selectedDate,
      tomorrowIntention,
      lastUpdated: new Date().toISOString(),
    };
    const newRecords = {
      ...records,
      [selectedDate]: updatedRecord,
    };
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  // Add custom habit
  const handleAddCustomHabit = (newHabit: HabitItem) => {
    const currentCustoms = getStoredCustomHabits();
    const updatedCustoms = [...currentCustoms, newHabit];
    saveStoredCustomHabits(updatedCustoms);
    setHabits(getAllHabits());
  };

  // Delete custom habit
  const handleDeleteCustomHabit = (habitId: string) => {
    const currentCustoms = getStoredCustomHabits();
    const updatedCustoms = currentCustoms.filter((h) => h.id !== habitId);
    saveStoredCustomHabits(updatedCustoms);
    setHabits(getAllHabits());
  };

  // Open Tasbeeh with target habit
  const handleOpenTasbeehWithHabit = (habit: HabitItem) => {
    setTasbeehHabit(habit);
    setIsTasbeehOpen(true);
  };

  // Apply Tasbeeh count directly to habit
  const handleApplyTasbeehCount = (habitId: string, count: number) => {
    handleHabitChange(habitId, count);
  };

  // Completion stats for selected date
  const completion = calculateCompletion(habits, currentRecord.values);
  const streak = calculateStreak(records, habits);

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-cairo transition-colors duration-200">
      {/* 1. Header with exact branding, dark mode toggle, and links from screenshot */}
      <Header
        profile={profile}
        currentNav={currentNav}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onChangeNav={(nav) => {
          setCurrentNav(nav);
          if (nav === 'habits') {
            scrollToChecklist();
          }
        }}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenTasbeeh={() => {
          setTasbeehHabit(null);
          setIsTasbeehOpen(true);
        }}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 2. Hero Greeting & Deep Green Banner matching screenshot */}
        <HeroBanner
          profile={profile}
          selectedDate={selectedDate}
          completedCount={completion.completedCount}
          totalCount={completion.totalCount}
          percentage={completion.percentage}
          onOpenReport={() => setIsReportOpen(true)}
          onStartAccounting={scrollToChecklist}
        />

        {/* 3. The Four Main Pillars section ("تفصيل الأقسام الأربعة") from screenshot */}
        <FourPillarsSection
          habits={habits}
          values={currentRecord.values}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onScrollToHabits={scrollToChecklist}
        />

        {/* 4. Weekly Recharts Progress Charts */}
        <WeeklyCharts
          habits={habits}
          records={records}
          targetRate={profile.targetRate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            scrollToChecklist();
          }}
        />

        {/* 5. Date Navigator */}
        <div ref={checklistRef} className="pt-2">
          <DateNavigator
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            records={records}
            habits={habits}
          />
        </div>

        {/* 6. Habits Checklist */}
        <HabitList
          habits={habits}
          record={currentRecord}
          values={currentRecord.values}
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onChangeHabit={handleHabitChange}
          onDeleteCustomHabit={handleDeleteCustomHabit}
          onOpenTasbeehWithHabit={handleOpenTasbeehWithHabit}
          onUpdatePrayerDetail={handleUpdatePrayerDetail}
          onUpdateQiyamData={handleUpdateQiyamData}
          onUpdateAdhkarProgress={handleUpdateAdhkarProgress}
          onUpdateAdhkarCustomTarget={handleUpdateAdhkarCustomTarget}
          onSaveMoralObstacleNote={handleSaveMoralObstacleNote}
          onUpdateCharityGoal={handleUpdateCharityGoal}
          onAddCharityGoal={handleAddCharityGoal}
          onDeleteCharityGoal={handleDeleteCharityGoal}
        />

        {/* 7. Motivational Wisdom Quote */}
        <MotivationalQuote />

        {/* 8. Daily Reflection & Repentance Section */}
        <ReflectionSection
          notes={currentRecord.notes}
          tomorrowIntention={currentRecord.tomorrowIntention}
          onChangeNotes={handleNotesChange}
          onChangeTomorrowIntention={handleTomorrowIntentionChange}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-6 text-center text-xs text-stone-500 dark:text-stone-400 font-cairo transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-amiri text-sm text-stone-700 dark:text-stone-300">
            «حاسبوا أنفسكم قبل أن تُحاسبوا، وزِنوا أنفسكم قبل أن تُوزنوا»
          </p>
          <div className="flex items-center gap-4 text-stone-400 dark:text-stone-500 text-[11px]">
            <span>محاسبة النفس - زاد المؤمن اليومي</span>
            <span>·</span>
            <span>بياناتك محفوظة محلياً على جهازك</span>
          </div>
        </div>
      </footer>

      {/* Welcome Greeting Modal with requested Quranic Ayah */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        profile={profile}
      />

      {/* Focus Timer Modal (مؤقت التركيز للورد القرآني والأذكار) */}
      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        onCompleteSession={(mins) => {
          // Session logged
        }}
      />

      {/* Printable Daily Accounting Report Modal */}
      <DailyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        record={currentRecord}
        habits={habits}
        profile={profile}
      />

      {/* Digital Tasbeeh Modal */}
      <DigitalTasbeehModal
        isOpen={isTasbeehOpen}
        onClose={() => {
          setIsTasbeehOpen(false);
          setTasbeehHabit(null);
        }}
        initialHabit={tasbeehHabit}
        onApplyCountToHabit={handleApplyTasbeehCount}
      />

      {/* Add Custom Habit Modal */}
      <AddHabitModal
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
        onAddHabit={handleAddCustomHabit}
      />

      {/* User Profile & Settings Modal with Dark Mode Toggle */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
