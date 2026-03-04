/**
 * A single recorded location sample.
 * - `timestamp` is the capture time in milliseconds since epoch.
 * - `accuracy` is the OS-provided estimated horizontal accuracy in meters.
 */
export type PathPoint = {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number | null;
};

/**
 * Current map mode selected by the user.
 * - `footprint`: render all historical points.
 * - `date`: render points for one specific day only.
 */
export type ActiveView =
  | { type: 'footprint' }
  | { type: 'date'; dateKey: string; title: string };

/**
 * Foreground location authorization state used by the recording hook.
 */
export type PermissionState = 'unknown' | 'granted' | 'denied';

/**
 * Reusable menu option shape for date-related tabs.
 */
export type DateMenuItem = {
  dateKey: string;
  label: string;
  title: string;
};
