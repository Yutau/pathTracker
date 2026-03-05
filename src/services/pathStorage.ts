import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  POINT_DEDUPE_DISTANCE_METERS,
  POINT_DEDUPE_TIME_WINDOW_MS,
  STORAGE_KEY,
} from '../constants/path';
import type { PathPoint } from '../types/path';
import { distanceBetweenPointsKm, normalizeStoredPoints, sortPointsChronological } from '../utils/path';

type AppendOptions = {
  dedupeTimeWindowMs?: number;
  dedupeDistanceMeters?: number;
};

function isDuplicatePoint(
  previous: PathPoint | undefined,
  next: PathPoint,
  options?: AppendOptions,
): boolean {
  if (!previous) {
    return false;
  }

  const maxTimeWindow = options?.dedupeTimeWindowMs ?? POINT_DEDUPE_TIME_WINDOW_MS;
  const maxDistanceMeters = options?.dedupeDistanceMeters ?? POINT_DEDUPE_DISTANCE_METERS;
  const timeDelta = Math.abs(next.timestamp - previous.timestamp);
  const distanceMeters = distanceBetweenPointsKm(previous, next) * 1000;

  return timeDelta < maxTimeWindow && distanceMeters < maxDistanceMeters;
}

/**
 * Reads and validates persisted points from AsyncStorage.
 * Returns an empty list if storage has no data for the key.
 */
export async function loadStoredPoints(): Promise<PathPoint[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  // Parse as unknown first, then sanitize in normalizeStoredPoints.
  const parsed = JSON.parse(raw) as unknown;
  return normalizeStoredPoints(parsed);
}

/**
 * Persists the full point list snapshot.
 * Current strategy is simple overwrite; sufficient for current scale.
 */
export async function savePoints(points: PathPoint[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}

/**
 * Appends multiple points using one read/write cycle and dedupe rules.
 * Returns the updated canonical point list and the number of added points.
 */
export async function appendPointsWithDedupe(
  incomingPoints: PathPoint[],
  options?: AppendOptions,
): Promise<{ points: PathPoint[]; added: number }> {
  if (incomingPoints.length === 0) {
    const existing = await loadStoredPoints();
    return { points: existing, added: 0 };
  }

  const existing = await loadStoredPoints();
  const sortedIncoming = sortPointsChronological(incomingPoints);
  const nextPoints = [...existing];
  let added = 0;

  sortedIncoming.forEach((point) => {
    const lastPoint = nextPoints[nextPoints.length - 1];
    if (isDuplicatePoint(lastPoint, point, options)) {
      return;
    }
    nextPoints.push(point);
    added += 1;
  });

  const canonical = sortPointsChronological(nextPoints);
  await savePoints(canonical);
  return { points: canonical, added };
}
