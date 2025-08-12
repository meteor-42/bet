import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseMatchDateTime = (match_date: string, match_time: string): Date | null => {
  try {
    let yyyy = '';
    let mm = '';
    let dd = '';
    // date can be YYYY-MM-DD or DD.MM.YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(match_date)) {
      [yyyy, mm, dd] = match_date.split('-');
    } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(match_date)) {
      const m = match_date.split('.');
      dd = m[0]; mm = m[1]; yyyy = m[2];
    } else {
      const d = new Date(match_date);
      if (!isNaN(d.getTime())) return d;
      return null;
    }

    // time can be HH:MM or HH:MM:SS
    let hh = '00', min = '00', ss = '00';
    const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec((match_time || '').trim());
    if (t) {
      hh = t[1];
      min = t[2];
      ss = t[3] ?? '00';
    }

    const dateStr = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`; // local ISO-like
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return null;
    return dt;
  } catch {
    return null;
  }
};

export const normalizeMatchDate = (value: string): string => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return value;
};

export const normalizeMatchTime = (value: string): string => {
  const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (t) return `${t[1]}:${t[2]}:${t[3] ?? '00'}`;
  return value;
};
