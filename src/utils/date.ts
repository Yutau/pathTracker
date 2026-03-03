import { DAY_MS } from '../constants/path';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function dateKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function dateKeyFromTimestamp(timestamp: number): string {
  return dateKeyFromDate(new Date(timestamp));
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getDateByOffset(daysAgo: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

export function getRelativeTitle(daysAgo: number): string {
  if (daysAgo === 1) {
    return 'Yesterday';
  }
  if (daysAgo === 2) {
    return 'Day Before Yesterday';
  }
  return `${daysAgo} Days Ago`;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatLongDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function dayDifferenceFromToday(dateKey: string): number {
  const todayStart = getDateByOffset(0).getTime();
  const targetDate = parseDateKey(dateKey);
  targetDate.setHours(0, 0, 0, 0);
  return Math.floor((todayStart - targetDate.getTime()) / DAY_MS);
}
