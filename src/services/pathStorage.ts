import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY } from '../constants/path';
import type { PathPoint } from '../types/path';
import { normalizeStoredPoints } from '../utils/path';

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
