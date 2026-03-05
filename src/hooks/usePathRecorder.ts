import * as Location from 'expo-location';
import { AppState } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { RECORD_INTERVAL_MS } from '../constants/path';
import {
  BACKGROUND_LOCATION_TASK_NAME,
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates,
} from '../services/backgroundLocation';
import { appendPointsWithDedupe, loadStoredPoints } from '../services/pathStorage';
import type { PathPoint, PermissionState } from '../types/path';

type UsePathRecorderResult = {
  points: PathPoint[];
  isLoading: boolean;
  isRecording: boolean;
  permissionState: PermissionState;
  statusMessage: string;
  startRecording: () => void;
  stopRecording: () => void;
};

/**
 * Converts expo-location objects into our persisted point model.
 */
function toPathPoint(location: Location.LocationObject): PathPoint {
  const timestamp = location.timestamp ?? Date.now();
  const coordinateAccuracy = location.coords.accuracy;
  return {
    id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    timestamp,
    accuracy:
      typeof coordinateAccuracy === 'number' && Number.isFinite(coordinateAccuracy)
        ? Math.round(coordinateAccuracy)
        : null,
  };
}

/**
 * Encapsulates the recording lifecycle:
 * - load path history
 * - start/stop foreground capture loop (4s cadence)
 * - start/stop OS background updates (best effort)
 * - keep UI state in sync with storage updates
 */
export function usePathRecorder(): UsePathRecorderResult {
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const [statusMessage, setStatusMessage] = useState('Ready. Tap Start Recording to begin.');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureInFlightRef = useRef(false);

  /**
   * Pulls canonical point list from storage.
   * Background task writes land in AsyncStorage, so foreground UI must re-sync on app resume.
   */
  const syncPointsFromStorage = useCallback(async (): Promise<void> => {
    const stored = await loadStoredPoints();
    setPoints(stored);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async (): Promise<void> => {
      try {
        const stored = await loadStoredPoints();
        if (active) {
          setPoints(stored);
        }
      } catch {
        if (active) {
          setStatusMessage('Failed to load local history.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncPointsFromStorage();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncPointsFromStorage]);

  /**
   * Foreground permission is mandatory for any location capture.
   */
  const ensureForegroundPermission = useCallback(async (): Promise<boolean> => {
    if (permissionState === 'granted') {
      return true;
    }

    const existing = await Location.getForegroundPermissionsAsync();
    if (existing.status === 'granted') {
      setPermissionState('granted');
      return true;
    }

    const requested = await Location.requestForegroundPermissionsAsync();
    const granted = requested.status === 'granted';
    setPermissionState(granted ? 'granted' : 'denied');
    return granted;
  }, [permissionState]);

  /**
   * Background permission is optional and only requested at recording start.
   * If rejected, app remains in foreground-only mode.
   */
  const requestBackgroundPermission = useCallback(async (): Promise<boolean> => {
    const existing = await Location.getBackgroundPermissionsAsync();
    if (existing.status === 'granted') {
      return true;
    }

    const requested = await Location.requestBackgroundPermissionsAsync();
    return requested.status === 'granted';
  }, []);

  /**
   * Grabs one foreground sample and appends it with dedupe strategy.
   * Dedupe avoids duplicated writes when foreground timer and background task overlap.
   */
  const captureLocationPoint = useCallback(async (): Promise<void> => {
    if (captureInFlightRef.current) {
      return;
    }

    captureInFlightRef.current = true;

    try {
      const granted = await ensureForegroundPermission();
      if (!granted) {
        setStatusMessage('Location permission denied. Recording stopped.');
        setIsRecording(false);
        void stopBackgroundLocationUpdates();
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });

      const point = toPathPoint(currentPosition);
      const { points: latestPoints } = await appendPointsWithDedupe([point]);
      setPoints(latestPoints);
    } catch {
      setStatusMessage('Location capture failed. Check GPS signal and permissions.');
    } finally {
      captureInFlightRef.current = false;
    }
  }, [ensureForegroundPermission]);

  useEffect(() => {
    const clearTicker = (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (!isRecording) {
      clearTicker();
      return clearTicker;
    }

    let cancelled = false;

    const startLoop = async (): Promise<void> => {
      const foregroundGranted = await ensureForegroundPermission();
      if (!foregroundGranted) {
        if (!cancelled) {
          setStatusMessage('Location permission denied. Recording stopped.');
          setIsRecording(false);
        }
        return;
      }

      if (cancelled) {
        return;
      }

      let backgroundHint =
        'Background recording is enabled (best effort and may stop after the app is force-closed).';
      let backgroundEnabled = false;

      try {
        const backgroundGranted = await requestBackgroundPermission();
        if (cancelled) {
          return;
        }

        if (backgroundGranted) {
          const backgroundResult = await startBackgroundLocationUpdates();
          backgroundEnabled = backgroundResult.started;
          if (!backgroundResult.started) {
            backgroundHint =
              backgroundResult.message ??
              'Background updates were stopped by the system. Foreground recording will continue.';
          }
        } else {
          backgroundHint =
            'Background permission denied. Recording continues only while the app is active.';
        }
      } catch {
        backgroundHint =
          'Background permission request failed. Recording continues only while the app is active.';
      }

      if (cancelled) {
        if (backgroundEnabled) {
          await stopBackgroundLocationUpdates();
        }
        return;
      }

      setStatusMessage(`Recording started. Capturing every 4 seconds. ${backgroundHint}`);
      await captureLocationPoint();

      if (cancelled) {
        return;
      }

      intervalRef.current = setInterval(() => {
        void captureLocationPoint();
      }, RECORD_INTERVAL_MS);
    };

    void startLoop();

    return () => {
      cancelled = true;
      clearTicker();
      void stopBackgroundLocationUpdates();
    };
  }, [isRecording, ensureForegroundPermission, requestBackgroundPermission, captureLocationPoint]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    let active = true;

    const verifyBackgroundTaskState = async (): Promise<void> => {
      try {
        const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
        if (!active || started) {
          return;
        }

        setStatusMessage(
          'Recording continues, but background updates were stopped by the system. Keep the app active for reliable capture.',
        );
      } catch {
        // No-op: the start flow already emits a fallback status when background start fails.
      }
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncPointsFromStorage();
        void verifyBackgroundTaskState();
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [isRecording, syncPointsFromStorage]);

  const startRecording = (): void => {
    if (isRecording) {
      return;
    }
    setIsRecording(true);
  };

  const stopRecording = (): void => {
    setIsRecording(false);
    void stopBackgroundLocationUpdates();
    setStatusMessage('Recording paused.');
  };

  return {
    points,
    isLoading,
    isRecording,
    permissionState,
    statusMessage,
    startRecording,
    stopRecording,
  };
}
