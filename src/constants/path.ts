export const STORAGE_KEY = 'path_tracker_points_v1';
export const RECORD_INTERVAL_MS = 20_000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const PREVIOUS_DAY_OFFSETS = [1, 2, 3] as const;

export const DEFAULT_REGION = {
  latitude: 37.0902,
  longitude: -95.7129,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

export const DATE_COLORS = ['#16a34a', '#0ea5e9', '#f97316', '#e11d48', '#06b6d4', '#ca8a04'];
