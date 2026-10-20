/**
 * Browser Notifications utility for Daily Self-Accounting (محاسبة النفس)
 * Supports permission requests, scheduled daily checks, and immediate test alerts.
 */
import { UserProfile } from '../types';
import { getTodayIsoString } from './dateUtils';
import { playIslamicChime } from './audio';

const STORAGE_KEY_LAST_NOTIFIED = 'muhasaba_last_notified_date';

/**
 * Check if the current browser environment supports the Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request permission from the user to display notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

/**
 * Trigger an instant browser notification
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const defaultOptions: NotificationOptions = {
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌙</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>',
      tag: 'muhasaba-daily-reminder',
      dir: 'rtl',
      lang: 'ar',
      requireInteraction: false,
      ...options,
    };

    const notification = new Notification(title, defaultOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.error('Error creating browser notification:', err);
    return null;
  }
}

/**
 * Send the official daily self-accounting reminder notification
 */
export function sendDailyAccountingNotification(userName?: string): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const name = userName?.trim() || 'أخي الكريم';
  const title = '🌙 حان موعد محاسبة النفس اليومية';
  const body = `السلام عليكم ورحمة الله، يا ${name}.. دقيقة لمراجعة طاعات اليوم وتجديد النية. «حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا».`;

  const notif = sendBrowserNotification(title, {
    body,
    tag: `muhasaba-reminder-${getTodayIsoString()}`,
  });

  if (notif) {
    try {
      playIslamicChime();
    } catch {
      // Audio chime fallback
    }
    return true;
  }
  return false;
}

/**
 * Send a test notification to verify setup
 */
export async function sendTestReminderNotification(userName?: string): Promise<{
  success: boolean;
  status: 'granted' | 'denied' | 'default' | 'unsupported';
  message: string;
}> {
  if (!isNotificationSupported()) {
    return {
      success: false,
      status: 'unsupported',
      message: 'متصفحك الحالي لا يدعم ميزة إشعارات سطح المكتب.',
    };
  }

  let permission: NotificationPermission | 'unsupported' = Notification.permission;
  if (permission === 'default') {
    permission = await requestNotificationPermission();
  }

  if (permission !== 'granted') {
    return {
      success: false,
      status: permission,
      message:
        permission === 'denied'
          ? 'تم حظر الإشعارات في إعدادات المتصفح. يُرجى تفعيل الإذن من شريط العنوان أعلى الصفحة.'
          : 'لم يتم منح إذن الإشعارات بعد.',
    };
  }

  const name = userName?.trim() || 'المبارك';
  const notif = sendBrowserNotification('🔔 تجربة إشعار محاسبة النفس الناجحة', {
    body: `أهلاً بك يا ${name}! إشعارات المتصفح مفعلة وتعمل بنجاح. ستصلك التذكيرات اليومية في موعدها بإذن الله.`,
    tag: 'muhasaba-test-notification',
  });

  if (notif) {
    try {
      playIslamicChime();
    } catch {
      // ignore audio error
    }
    return {
      success: true,
      status: 'granted',
      message: 'تم إرسال إشعار تجريبي بنجاح إلى شاشتك!',
    };
  }

  return {
    success: false,
    status: 'granted',
    message: 'تعذر إنشاء الإشعار، يرجى التأكد من عدم تفعيل وضع عدم الإزعاج (Do Not Disturb) في نظام التشغيل.',
  };
}

/**
 * Check if today's reminder should fire based on scheduled time (HH:mm)
 */
export function checkAndTriggerDailyReminder(profile: UserProfile): boolean {
  if (!profile.reminderEnabled) return false;
  if (!isNotificationSupported() || Notification.permission !== 'granted') return false;

  const todayStr = getTodayIsoString();
  const lastNotified = localStorage.getItem(STORAGE_KEY_LAST_NOTIFIED);

  // Already notified today
  if (lastNotified === todayStr) {
    return false;
  }

  const reminderTime = profile.reminderTime || '21:00'; // Default 9:00 PM
  const [targetHour, targetMinute] = reminderTime.split(':').map((v) => parseInt(v, 10));

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const currentMinutesFromMidnight = currentHour * 60 + currentMinute;
  const targetMinutesFromMidnight = targetHour * 60 + (targetMinute || 0);

  // If current time has reached or passed the reminder time today
  if (currentMinutesFromMidnight >= targetMinutesFromMidnight) {
    const sent = sendDailyAccountingNotification(profile.name);
    if (sent) {
      localStorage.setItem(STORAGE_KEY_LAST_NOTIFIED, todayStr);
      return true;
    }
  }

  return false;
}

/**
 * Format time string (e.g. "21:00") into friendly Arabic representation
 */
export function formatReminderTimeArabic(timeStr: string): string {
  if (!timeStr) return '09:00 م';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const isPM = h >= 12;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;

  const mFormatted = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${mFormatted} ${isPM ? 'م' : 'ص'}`;
}
