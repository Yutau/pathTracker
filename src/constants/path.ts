/**
 * Storage key for persisted location points.
 * Bump this value if the stored data format changes incompatibly.
 */
export const STORAGE_KEY = 'path_tracker_points_v1';

/**
 * The intended capture cadence for automatic recording.
 * 20 seconds is a practical balance between detail and battery usage.
 */
export const RECORD_INTERVAL_MS = 20_000;

/**
 * Milliseconds in one day, used for date-difference calculations.
 */
export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Offsets used when building quick date tabs.
 * Kept as const tuple to preserve literal types.
 */
export const PREVIOUS_DAY_OFFSETS = [1, 2, 3] as const;

/**
 * Fallback map region shown before we have any recorded coordinates.
 * The values roughly center on the continental US with a wide zoom.
 */
export const DEFAULT_REGION = {
  latitude: 37.0902,
  longitude: -95.7129,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

/**
 * Stable palette used to color date-based trajectories.
 * A day key is hashed into this array so each day gets a repeatable color.
 */
export const DATE_COLORS = ['#16a34a', '#0ea5e9', '#f97316', '#e11d48', '#06b6d4', '#ca8a04'];
