import type { DateString } from '../domain/habits/habit.types';

export function getTodayDateString(): DateString {
  const now = new Date();
  return formatDate(now);
}

export function formatDate(date: Date): DateString {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateString(dateStr: DateString): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getYesterdayDateString(date: DateString): DateString {
  const d = parseDateString(date);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export function getNextDateString(date: DateString): DateString {
  const d = parseDateString(date);
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

export function getLastNDates(endDate: DateString, days: number): DateString[] {
  const dates: DateString[] = [];
  let current = endDate;
  for (let i = 0; i < days; i++) {
    dates.unshift(current);
    current = getYesterdayDateString(current);
  }
  return dates;
}

export function getDayLabel(dateStr: DateString): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function offsetDateString(date: DateString, days: number): DateString {
  const d = parseDateString(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function formatShortDate(dateStr: DateString): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
