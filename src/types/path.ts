export type PathPoint = {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number | null;
};

export type ActiveView =
  | { type: 'footprint' }
  | { type: 'date'; dateKey: string; title: string };

export type PermissionState = 'unknown' | 'granted' | 'denied';

export type DateMenuItem = {
  dateKey: string;
  label: string;
  title: string;
};
