import { DAY_MS } from '../constants/path';

/**
 * Left-pad day/month numbers so generated date keys are lexically sortable.
 */
function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Converts a Date to our canonical day key format: YYYY-MM-DD.
 * This key is used as the primary grouping identifier for path points.
 */
export function dateKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Converts a timestamp to the canonical day key.
 */
export function dateKeyFromTimestamp(timestamp: number): string {
  return dateKeyFromDate(new Date(timestamp));
}

/**
 * Parses a canonical day key back into a local Date object.
 */
export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Returns the local date at midnight for "N days ago".
 * Example: 0 => today 00:00, 1 => yesterday 00:00.
 */
export function getDateByOffset(daysAgo: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Human-friendly relative labels for quick tabs.
 */
export function getRelativeTitle(daysAgo: number): string {
  if (daysAgo === 1) {
    return 'Yesterday';
  }
  if (daysAgo === 2) {
    return 'Day Before Yesterday';
  }
  return `${daysAgo} Days Ago`;
}

/**
 * Short date format used in compact UI contexts.
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Long date format used in explicit date displays.
 */
export function formatLongDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Time string for status messages like "Point captured at 08:43:10".
 */
export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Returns how many full days the target key is behind today.
 * Positive values mean "past days"; 0 means today.
 */
export function dayDifferenceFromToday(dateKey: string): number {
  const todayStart = getDateByOffset(0).getTime();
  const targetDate = parseDateKey(dateKey);
  targetDate.setHours(0, 0, 0, 0);
  return Math.floor((todayStart - targetDate.getTime()) / DAY_MS);
}
