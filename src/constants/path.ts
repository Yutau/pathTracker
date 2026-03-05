/**
 * Storage key for persisted location points.
 * Bump this value if the stored data format changes incompatibly.
 */
export const STORAGE_KEY = 'path_tracker_points_v1';

/**
 * The intended capture cadence for automatic recording.
 * Product requirement: collect a point every 4 seconds.
 */
export const RECORD_INTERVAL_MS = 4_000;

/**
 * Unified theme color used by date-specific route lines.
 * Keep this centralized so future customization only needs one integration point.
 */
export const ROUTE_THEME_COLOR = '#f97316';

/**
 * Default color for footprint point cloud rendering.
 */
export const FOOTPRINT_POINT_COLOR = '#f97316';

/**
 * Foreground/background dedupe thresholds to avoid double-writing near-identical points.
 */
export const POINT_DEDUPE_TIME_WINDOW_MS = 2_000;
export const POINT_DEDUPE_DISTANCE_METERS = 5;

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
