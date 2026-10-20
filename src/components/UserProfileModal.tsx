import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Check,
  Moon,
  Sun,
  Sliders,
  Bell,
  BellRing,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestReminderNotification,
  formatReminderTimeArabic,
} from '../utils/notifications';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  isDarkMode,
  onToggleDarkMode,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [targetRate, setTargetRate] = useState(profile.targetRate);
  const [reminderEnabled, setReminderEnabled] = useState(profile.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(profile.reminderTime || '21:00');
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setTargetRate(profile.targetRate);
      setReminderEnabled(profile.reminderEnabled ?? false);
      setReminderTime(profile.reminderTime || '21:00');
      setPermStatus(getNotificationPermission());
      setTestFeedback(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleToggleReminder = async () => {
    const nextState = !reminderEnabled;
    setReminderEnabled(nextState);

    // If turning on and permission not yet granted, request permission
    if (nextState && isNotificationSupported()) {
      const current = getNotificationPermission();
      if (current === 'default') {
        const res = await requestNotificationPermission();
        setPermStatus(res);
        if (res === 'granted') {
          setTestFeedback({
            type: 'success',
            text: 'تم منح إذن الإشعارات بنجاح! سيتم تنبيهك يومياً في الوقت المختار.',
          });
        }
      }
    }
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermStatus(res);
    if (res === 'granted') {
      setTestFeedback({
        type: 'success',
        text: 'تم السماح بالإشعارات بنجاح!',
      });
    } else if (res === 'denied') {
      setTestFeedback({
        type: 'error',
        text: 'تم حظر الإشعارات من المتصفح. يمكنك تفعيلها بالنقر على أيقونة الإعدادات/القفل بجانب شريط العنوان.',
      });
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestFeedback(null);
    try {
      const res = await sendTestReminderNotification(name);
      setPermStatus(getNotificationPermission());
      if (res.success) {
        setTestFeedback({
          type: 'success',
          text: 'تم إرسال إشعار تجريبي بنجاح! تفقد شاشتك أو مركز الإشعارات.',
        });
      } else {
        setTestFeedback({
          type: 'error',
          text: res.message,
        });
      }
    } catch {
      setTestFeedback({
        type: 'error',
        text: 'حدث خطأ أثناء إرسال الإشعار التجريبي.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveProfile({
      ...profile,
      name: name.trim(),
      targetRate: Number(targetRate) || 80,
      reminderEnabled,
      reminderTime,
      darkMode: isDarkMode,
    });
    onClose();
  };

  const timePresets = [
    { label: '09:00 م (بعد العشاء)', time: '21:00' },
    { label: '10:30 م (قبل النوم)', time: '22:30' },
    { label: '07:30 م (بعد المغرب)', time: '19:30' },
    { label: '05:00 ص (بعد الفجر)', time: '05:00' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-cairo">
              الإعدادات وإشعارات المحاسبة
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* 1. Name input */}
          <div>
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1 font-cairo">
              الاسم الكريم (يظهر في تقرير المحاسبة والترحيب والإشعارات) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد منصور، أو عبد الله"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo font-semibold text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* 2. Browser Notifications (الإشعارات المتصفحية للتذكير اليومي) */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-800 text-white shrink-0 mt-0.5">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 font-cairo">
                      إشعارات المتصفح والتذكير اليومي
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold font-cairo">
                      جديد
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 font-cairo mt-0.5">
                    إرسال تذكير يومي لطيف في موعد محدد لمراجعة طاعاتك ومحاسبة النفس
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleReminder}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  reminderEnabled ? 'bg-emerald-700' : 'bg-stone-300 dark:bg-stone-600'
                }`}
                role="switch"
                aria-checked={reminderEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    reminderEnabled ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Notification Permission State & Settings when enabled */}
            {reminderEnabled && (
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 space-y-3 animate-in fade-in duration-150">
                {/* Permission Status Feedback */}
                {permStatus === 'granted' ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 px-3 py-2 rounded-xl font-cairo">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>إذن الإشعارات مفعّل في المتصفح وجاهز للعمل.</span>
                  </div>
                ) : permStatus === 'denied' ? (
                  <div className="flex items-start gap-2 text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-2 rounded-xl font-cairo">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <span className="block font-bold">الإشعارات محظورة في متصفحك!</span>
                      <span className="text-[11px] font-normal block mt-0.5 opacity-90">
                        يُرجى السماح بالإشعارات من أيقونة الإعدادات/القفل بجوار عنوان الموقع ثم إعادة المحاولة.
                      </span>
                    </div>
                  </div>
                ) : permStatus === 'unsupported' ? (
                  <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-xl font-cairo">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>متصفحك لا يدعم Notification API.</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                    <div className="text-xs text-amber-900 dark:text-amber-200 font-cairo">
                      يتطلب المتصفح موافقتك لإظهار التذكيرات
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors font-cairo shrink-0"
                    >
                      منح الإذن الآن
                    </button>
                  </div>
                )}

                {/* Reminder Time Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 font-cairo flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                      <span>موعد التذكير اليومي:</span>
                    </label>
                    <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 font-cairo tabular-nums">
                      {formatReminderTimeArabic(reminderTime)}
                    </span>
                  </div>

                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-cairo font-semibold text-stone-900 dark:text-stone-100"
                  />

                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.time}
                        type="button"
                        onClick={() => setReminderTime(preset.time)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold font-cairo transition-all border ${
                          reminderTime === preset.time
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test notification button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    disabled={isTesting}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-xl transition-all shadow-xs font-cairo disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>{isTesting ? 'جارٍ الإرسال...' : 'تجربة إشعار فوري الآن'}</span>
                  </button>

                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-cairo text-center sm:text-right">
                    يصلك التنبيه تلقائياً طالما التطبيق مفتوح بالمتصفح
                  </span>
                </div>

                {/* Feedback message */}
                {testFeedback && (
                  <div
                    className={`text-xs px-3 py-2 rounded-xl font-cairo flex items-center gap-1.5 ${
                      testFeedback.type === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-rose-100 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {testFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>{testFeedback.text}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Dark Mode Toggle */}
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/70 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-600" />
                )}
                <div>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block font-cairo">
                    مظهر التطبيق (الوضع الليلي)
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-cairo">
                    مريح للعينين أثناء القراءة في الإضاءة الخافتة وقيام الليل
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDarkMode ? 'bg-emerald-700' : 'bg-stone-300 dark:bg-stone-600'
                }`}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isDarkMode ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Choice Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode) onToggleDarkMode();
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  !isDarkMode
                    ? 'bg-white text-stone-900 border-emerald-700 shadow-xs ring-1 ring-emerald-700/20'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-transparent hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>الوضع النهاري</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode) onToggleDarkMode();
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  isDarkMode
                    ? 'bg-stone-900 text-amber-300 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-transparent hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>الوضع الليلي</span>
              </button>
            </div>
          </div>

          {/* 4. Daily Target Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 font-cairo">
                الهدف اليومي المستهدف للإنجاز
              </label>
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 tabular-nums">
                {targetRate}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={targetRate}
              onChange={(e) => setTargetRate(Number(e.target.value))}
              className="w-full accent-emerald-800 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 font-cairo mt-1">
              <span>50% مجاهدة أولى</span>
              <span>80% طموح طيب</span>
              <span>100% كمال واستيعاب</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
