import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY } from '../constants/path';
import type { PathPoint } from '../types/path';
import { normalizeStoredPoints } from '../utils/path';

export async function loadStoredPoints(): Promise<PathPoint[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as unknown;
  return normalizeStoredPoints(parsed);
}

export async function savePoints(points: PathPoint[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}
