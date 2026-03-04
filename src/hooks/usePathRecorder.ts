import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { RECORD_INTERVAL_MS } from '../constants/path';
import type { PermissionState, PathPoint } from '../types/path';
import { formatClock } from '../utils/date';
import { sortPointsChronological } from '../utils/path';
import { loadStoredPoints, savePoints } from '../services/pathStorage';

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
 * Encapsulates the full recording lifecycle:
 * - load/persist point history
 * - request and track location permission
 * - capture location on a fixed interval
 * - expose simple start/stop controls to the UI
 */
export function usePathRecorder(): UsePathRecorderResult {
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const [statusMessage, setStatusMessage] = useState('Ready. Tap Start Recording to begin.');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureInFlightRef = useRef(false);

  useEffect(() => {
    let active = true;

    // Load persisted points once on mount.
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
    // Skip persistence while initial hydration is in progress.
    if (isLoading) {
      return;
    }

    // Persist every mutation so the app can recover state after restart.
    savePoints(points).catch(() => {
      setStatusMessage('Failed to save local history.');
    });
  }, [points, isLoading]);

  // Requests permission lazily and memoizes granted state in local hook state.
  const ensureLocationPermission = useCallback(async (): Promise<boolean> => {
    if (permissionState === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    setPermissionState(granted ? 'granted' : 'denied');
    return granted;
  }, [permissionState]);

  /**
   * Captures one GPS sample and appends it to the path.
   * The in-flight guard prevents overlapping location requests.
   */
  const captureLocationPoint = useCallback(async (): Promise<void> => {
    if (captureInFlightRef.current) {
      return;
    }

    captureInFlightRef.current = true;

    try {
      const granted = await ensureLocationPermission();
      if (!granted) {
        setStatusMessage('Location permission denied.');
        setIsRecording(false);
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });

      const timestamp = currentPosition.timestamp ?? Date.now();
      const coordinateAccuracy = currentPosition.coords.accuracy;
      const point: PathPoint = {
        id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        timestamp,
        // Round to keep UI/debug output readable while preserving rough accuracy signal.
        accuracy:
          typeof coordinateAccuracy === 'number' && Number.isFinite(coordinateAccuracy)
            ? Math.round(coordinateAccuracy)
            : null,
      };

      setPoints((previous) => sortPointsChronological([...previous, point]));
      setStatusMessage(`Point captured at ${formatClock(timestamp)}.`);
    } catch {
      setStatusMessage('Location capture failed. Check GPS signal and permissions.');
    } finally {
      captureInFlightRef.current = false;
    }
  }, [ensureLocationPermission]);

  useEffect(() => {
    // Clears active timer; shared between early returns and cleanup.
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

    // Starts recording loop: immediate capture + fixed interval captures.
    const startLoop = async (): Promise<void> => {
      const granted = await ensureLocationPermission();
      if (!granted) {
        if (!cancelled) {
          setStatusMessage('Location permission denied. Recording stopped.');
          setIsRecording(false);
        }
        return;
      }

      if (cancelled) {
        return;
      }

      setStatusMessage('Recording started. Capturing every 20 seconds.');
      await captureLocationPoint();

      if (cancelled) {
        return;
      }

      intervalRef.current = setInterval(() => {
        // Fire-and-forget; captureLocationPoint has internal in-flight protection.
        void captureLocationPoint();
      }, RECORD_INTERVAL_MS);
    };

    void startLoop();

    return () => {
      cancelled = true;
      clearTicker();
    };
  }, [isRecording, ensureLocationPermission, captureLocationPoint]);

  const startRecording = (): void => {
    // State transition only; effect above handles actual loop start.
    setIsRecording(true);
  };

  const stopRecording = (): void => {
    // State transition only; effect cleanup clears timer.
    setIsRecording(false);
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
