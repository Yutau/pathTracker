import { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { MoreDatesModal } from './src/components/MoreDatesModal';
import { PathMapCard } from './src/components/PathMapCard';
import { PathMenu } from './src/components/PathMenu';
import { RecordingControls } from './src/components/RecordingControls';
import { PREVIOUS_DAY_OFFSETS } from './src/constants/path';
import { usePathRecorder } from './src/hooks/usePathRecorder';
import type { ActiveView, DateMenuItem } from './src/types/path';
import {
  dateKeyFromDate,
  dateKeyFromTimestamp,
  dayDifferenceFromToday,
  getDateByOffset,
  getRelativeTitle,
} from './src/utils/date';
import { hashColorByDate, sortPointsChronological, toCoordinate } from './src/utils/path';

export default function App(): JSX.Element {
  const todayDate = getDateByOffset(0);
  const todayDateKey = dateKeyFromDate(todayDate);

  const {
    points,
    isLoading,
    isRecording,
    permissionState,
    startRecording,
    stopRecording,
  } = usePathRecorder();

  const [activeView, setActiveView] = useState<ActiveView>({
    type: 'date',
    dateKey: todayDateKey,
    title: 'Today',
  });
  const [isMoreVisible, setIsMoreVisible] = useState(false);

  const previousDayMenus = useMemo<DateMenuItem[]>(
    () =>
      PREVIOUS_DAY_OFFSETS.map((offset) => {
        const date = getDateByOffset(offset);
        const title = getRelativeTitle(offset);
        const shortLabel = offset === 1 ? 'Yesterday' : `${offset} day ago`;
        return {
          dateKey: dateKeyFromDate(date),
          title,
          label: shortLabel,
        };
      }),
    [],
  );

  const allDateKeys = useMemo(() => {
    const unique = new Set<string>();
    points.forEach((point) => {
      unique.add(dateKeyFromTimestamp(point.timestamp));
    });
    return Array.from(unique).sort((a, b) => (a > b ? -1 : 1));
  }, [points]);

  const olderDateKeys = useMemo(
    () => allDateKeys.filter((dateKey) => dayDifferenceFromToday(dateKey) > 3),
    [allDateKeys],
  );

  const displayedPoints = useMemo(() => {
    const sorted = sortPointsChronological(points);
    if (activeView.type === 'footprint') {
      return sorted;
    }

    return sorted.filter((point) => dateKeyFromTimestamp(point.timestamp) === activeView.dateKey);
  }, [points, activeView]);

  const coordinates = useMemo(() => displayedPoints.map(toCoordinate), [displayedPoints]);

  const lineColor = activeView.type === 'footprint' ? '#16a34a' : hashColorByDate(activeView.dateKey);

  const openDateView = (dateKey: string, title: string): void => {
    setActiveView({ type: 'date', dateKey, title });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.screen}>
        <PathMapCard
          coordinates={coordinates}
          lineColor={lineColor}
          permissionGranted={permissionState === 'granted'}
          isLoading={isLoading}
        />

        <View pointerEvents="none" style={styles.topShadePrimary} />
        <View pointerEvents="none" style={styles.topShadeSecondary} />
        <View pointerEvents="none" style={styles.bottomShadePrimary} />
        <View pointerEvents="none" style={styles.bottomShadeSecondary} />

        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <Text style={styles.brandIcon}>➤</Text>
              <Text style={styles.brandTitle}>PathTracker</Text>
            </View>

            <PathMenu
              activeView={activeView}
              todayDateKey={todayDateKey}
              previousDayMenus={previousDayMenus}
              onSelectFootprint={() => setActiveView({ type: 'footprint' })}
              onSelectDate={openDateView}
              onPressMore={() => setIsMoreVisible(true)}
            />
          </View>

          <View style={styles.bottomBar}>
            <RecordingControls isRecording={isRecording} onStart={startRecording} onStop={stopRecording} />
          </View>
        </View>
      </View>

      <MoreDatesModal
        visible={isMoreVisible}
        onClose={() => setIsMoreVisible(false)}
        olderDateKeys={olderDateKeys}
        activeView={activeView}
        onSelectDate={openDateView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050a12',
  },
  screen: {
    flex: 1,
    backgroundColor: '#050a12',
  },
  topShadePrimary: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(29, 78, 117, 0.46)',
  },
  topShadeSecondary: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  bottomShadePrimary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(2, 6, 23, 0.52)',
  },
  bottomShadeSecondary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: 'rgba(2, 6, 23, 0.20)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  topBar: {
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandIcon: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: '700',
  },
  brandTitle: {
    color: '#f1f5f9',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 4,
  },
});
