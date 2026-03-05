import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { RECORD_INTERVAL_MS } from '../constants/path';
import type { PathPoint } from '../types/path';
import { appendPointsWithDedupe } from './pathStorage';

export const BACKGROUND_LOCATION_TASK_NAME = 'path_tracker_background_location';

let taskRegistered = false;

/**
 * Define background task once per JS runtime.
 * The task appends incoming background locations into shared storage with dedupe.
 */
export function registerBackgroundLocationTask(): void {
  if (taskRegistered || TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK_NAME)) {
    taskRegistered = true;
    return;
  }

  TaskManager.defineTask(BACKGROUND_LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      return;
    }

    const payload = data as { locations?: Location.LocationObject[] } | undefined;
    const locations = payload?.locations ?? [];
    if (locations.length === 0) {
      return;
    }

    const points: PathPoint[] = locations.map((location) => {
      const timestamp = location.timestamp ?? Date.now();
      const accuracy = location.coords.accuracy;
      return {
        id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp,
        accuracy: typeof accuracy === 'number' && Number.isFinite(accuracy) ? Math.round(accuracy) : null,
      };
    });

    await appendPointsWithDedupe(points);
  });

  taskRegistered = true;
}

/**
 * Starts OS-managed background location updates.
 * Returns false when start fails but keeps app running in foreground mode.
 */
export async function startBackgroundLocationUpdates(): Promise<{ started: boolean; message?: string }> {
  registerBackgroundLocationTask();

  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: RECORD_INTERVAL_MS,
        distanceInterval: 0,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'PathTracker is recording',
          notificationBody: 'Path recording continues in the background.',
        },
      });
    }
    return { started: true };
  } catch {
    return {
      started: false,
      message:
        'Background updates could not start. Foreground recording will continue, but system limits may apply.',
    };
  }
}

/**
 * Stops OS-managed background location updates if currently active.
 */
export async function stopBackgroundLocationUpdates(): Promise<void> {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
    }
  } catch {
    // No-op by design: stopping background updates should never crash UI flow.
  }
}

registerBackgroundLocationTask();
