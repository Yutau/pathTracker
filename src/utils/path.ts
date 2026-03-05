import type { LatLng } from 'react-native-maps';

import {
  DATE_COLORS,
  FOOTPRINT_POINT_COLOR,
  ROUTE_THEME_COLOR,
} from '../constants/path';
import type { PathPoint, PathRenderMode } from '../types/path';

/**
 * Returns a new array sorted by timestamp ascending.
 * We sort before drawing so polyline segments follow travel order.
 */
export function sortPointsChronological(points: PathPoint[]): PathPoint[] {
  return [...points].sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Converts an internal point object into map coordinate format.
 */
export function toCoordinate(point: PathPoint): LatLng {
  return { latitude: point.latitude, longitude: point.longitude };
}

/**
 * Maps a date key to a deterministic color index.
 * This keeps a date's color stable across app sessions.
 */
export function hashColorByDate(dateKey: string): string {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % DATE_COLORS.length;
  }
  return DATE_COLORS[Math.abs(hash) % DATE_COLORS.length];
}

/**
 * Optional color overrides that allow external configuration in the future.
 */
export type RouteColorOverrides = {
  dateRouteColor?: string;
  footprintPointColor?: string;
};

/**
 * Centralized route/point color resolver.
 * Current behavior is theme-based, but callers can inject overrides later.
 */
export function getPathThemeColor(
  mode: PathRenderMode,
  overrides?: RouteColorOverrides,
): string {
  if (mode === 'date-route') {
    return overrides?.dateRouteColor ?? ROUTE_THEME_COLOR;
  }
  return overrides?.footprintPointColor ?? FOOTPRINT_POINT_COLOR;
}

/**
 * Great-circle distance using the Haversine formula.
 * Result unit: kilometers.
 */
export function distanceBetweenPointsKm(start: PathPoint, end: PathPoint): number {
  const rad = Math.PI / 180;
  const lat1 = start.latitude * rad;
  const lat2 = end.latitude * rad;
  const deltaLat = (end.latitude - start.latitude) * rad;
  const deltaLon = (end.longitude - start.longitude) * rad;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

/**
 * Accumulates travel distance over a chronologically ordered path.
 */
export function totalDistanceKm(points: PathPoint[]): number {
  if (points.length < 2) {
    return 0;
  }

  let distance = 0;
  for (let i = 1; i < points.length; i += 1) {
    distance += distanceBetweenPointsKm(points[i - 1], points[i]);
  }
  return distance;
}

/**
 * Defensive parser for persisted point arrays.
 * Invalid records are ignored to keep corrupted storage from crashing the app.
 */
export function normalizeStoredPoints(raw: unknown): PathPoint[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const points: PathPoint[] = [];
  raw.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const candidate = item as Partial<PathPoint>;
    const latitude = Number(candidate.latitude);
    const longitude = Number(candidate.longitude);
    const timestamp = Number(candidate.timestamp);

    // Only accept fully numeric coordinates/time values.
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(timestamp)) {
      return;
    }

    points.push({
      id:
        typeof candidate.id === 'string' && candidate.id.length > 0
          ? candidate.id
          : `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      latitude,
      longitude,
      timestamp,
      // Accuracy may be absent on some platforms/conditions.
      accuracy: Number.isFinite(Number(candidate.accuracy)) ? Number(candidate.accuracy) : null,
    });
  });

  return sortPointsChronological(points);
}
