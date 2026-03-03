import { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { MoreDatesModal } from './src/components/MoreDatesModal';
import { PathMapCard } from './src/components/PathMapCard';
import { PathMenu } from './src/components/PathMenu';
import { RecordingControls } from './src/components/RecordingControls';
import { SummaryCard } from './src/components/SummaryCard';
import { PREVIOUS_DAY_OFFSETS } from './src/constants/path';
import { usePathRecorder } from './src/hooks/usePathRecorder';
import type { ActiveView, DateMenuItem } from './src/types/path';
import {
  dateKeyFromDate,
  dateKeyFromTimestamp,
  dayDifferenceFromToday,
  formatLongDate,
  formatShortDate,
  getDateByOffset,
  getRelativeTitle,
} from './src/utils/date';
import { hashColorByDate, sortPointsChronological, toCoordinate, totalDistanceKm } from './src/utils/path';

export default function App(): JSX.Element {
  const todayDate = getDateByOffset(0);
  const todayDateKey = dateKeyFromDate(todayDate);

  const {
    points,
    isLoading,
    isRecording,
    permissionState,
    statusMessage,
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
        return {
          dateKey: dateKeyFromDate(date),
          title,
          label: `${title} · ${formatShortDate(date)}`,
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
  const summaryDistance = totalDistanceKm(displayedPoints);

  const viewTitle =
    activeView.type === 'footprint'
      ? 'Footprint · All Historical Paths'
      : `${activeView.title} · ${formatLongDate(activeView.dateKey)}`;

  const openDateView = (dateKey: string, title: string): void => {
    setActiveView({ type: 'date', dateKey, title });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.backgroundCircleOne} />
      <View style={styles.backgroundCircleTwo} />

      <View style={styles.screen}>
        <Text style={styles.title}>Path Tracker</Text>
        <Text style={styles.subtitle}>Record daily routes on iOS and Android</Text>

        <RecordingControls isRecording={isRecording} onStart={startRecording} onStop={stopRecording} />

        <PathMenu
          activeView={activeView}
          todayDate={todayDate}
          todayDateKey={todayDateKey}
          previousDayMenus={previousDayMenus}
          olderDateCount={olderDateKeys.length}
          onSelectFootprint={() => setActiveView({ type: 'footprint' })}
          onSelectDate={openDateView}
          onPressMore={() => setIsMoreVisible(true)}
        />

        <PathMapCard
          coordinates={coordinates}
          lineColor={lineColor}
          permissionGranted={permissionState === 'granted'}
          isLoading={isLoading}
          statusMessage={statusMessage}
        />

        <SummaryCard
          viewTitle={viewTitle}
          displayedPoints={displayedPoints}
          summaryDistance={summaryDistance}
        />
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
    backgroundColor: '#f3f7f6',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backgroundCircleOne: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#dbeafe',
  },
  backgroundCircleTwo: {
    position: 'absolute',
    bottom: 80,
    left: -70,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#dcfce7',
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    color: '#0f172a',
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#334155',
  },
});
