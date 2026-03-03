import type { LatLng } from 'react-native-maps';

import { DATE_COLORS } from '../constants/path';
import type { PathPoint } from '../types/path';

export function sortPointsChronological(points: PathPoint[]): PathPoint[] {
  return [...points].sort((a, b) => a.timestamp - b.timestamp);
}

export function toCoordinate(point: PathPoint): LatLng {
  return { latitude: point.latitude, longitude: point.longitude };
}

export function hashColorByDate(dateKey: string): string {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % DATE_COLORS.length;
  }
  return DATE_COLORS[Math.abs(hash) % DATE_COLORS.length];
}

function haversineDistanceKm(start: PathPoint, end: PathPoint): number {
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

export function totalDistanceKm(points: PathPoint[]): number {
  if (points.length < 2) {
    return 0;
  }

  let distance = 0;
  for (let i = 1; i < points.length; i += 1) {
    distance += haversineDistanceKm(points[i - 1], points[i]);
  }
  return distance;
}

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
      accuracy: Number.isFinite(Number(candidate.accuracy)) ? Number(candidate.accuracy) : null,
    });
  });

  return sortPointsChronological(points);
}
