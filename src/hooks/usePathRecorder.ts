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
    if (isLoading) {
      return;
    }

    savePoints(points).catch(() => {
      setStatusMessage('Failed to save local history.');
    });
  }, [points, isLoading]);

  const ensureLocationPermission = useCallback(async (): Promise<boolean> => {
    if (permissionState === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    setPermissionState(granted ? 'granted' : 'denied');
    return granted;
  }, [permissionState]);

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
    setIsRecording(true);
  };

  const stopRecording = (): void => {
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
