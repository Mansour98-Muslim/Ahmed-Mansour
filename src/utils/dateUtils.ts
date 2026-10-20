/**
 * Arabic Date Utilities (Hijri and Gregorian) using Latin numerals with Arabic text (ar-u-nu-latn)
 */

export function getTodayIsoString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDate(isoDate: string, daysOffset: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setDate(target.getDate() + daysOffset);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatGregorianArabic(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  try {
    const formatter = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(dateObj);
  } catch {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${days[dateObj.getDay()]}، ${d} ${months[m - 1]} ${y}`;
  }
}

export function formatHijriArabic(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(dateObj) + ' هـ';
  } catch {
    return 'الاثنين، 8 جمادى الأولى 1448 هـ';
  }
}

export function getCombinedDateDisplay(isoDate: string): { hijri: string; gregorian: string; combined: string } {
  const hijri = formatHijriArabic(isoDate);
  const gregorian = formatGregorianArabic(isoDate);
  return {
    hijri,
    gregorian,
    combined: `${hijri} · ${gregorian}`,
  };
}

export function getHijriShort(isoDate: string): { day: number; month: string } {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  try {
    const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'short',
    }).formatToParts(dateObj);
    const day = Number(parts.find((p) => p.type === 'day')?.value) || d;
    const month = parts.find((p) => p.type === 'month')?.value || '';
    return { day, month };
  } catch {
    return { day: d, month: '' };
  }
}

export function getDayLabel(isoDate: string): string {
  const today = getTodayIsoString();
  const yesterday = shiftDate(today, -1);
  const tomorrow = shiftDate(today, 1);

  if (isoDate === today) return 'اليوم';
  if (isoDate === yesterday) return 'أمس';
  if (isoDate === tomorrow) return 'غداً';

  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[dateObj.getDay()];
}
