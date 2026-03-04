import { useMemo, useState } from 'react';
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { MoreDatesModal } from './src/components/MoreDatesModal';
import { PathMapCard } from './src/components/PathMapCard';
import { RecordingControls } from './src/components/RecordingControls';
import { usePathRecorder } from './src/hooks/usePathRecorder';
import type { ActiveView } from './src/types/path';
import { dateKeyFromDate, dateKeyFromTimestamp, dayDifferenceFromToday, getDateByOffset } from './src/utils/date';
import { hashColorByDate, sortPointsChronological, toCoordinate } from './src/utils/path';

function viewLabel(activeView: ActiveView): string {
  if (activeView.type === 'footprint') {
    return 'Footprint';
  }

  const diff = dayDifferenceFromToday(activeView.dateKey);
  if (diff <= 0) {
    return 'Today';
  }
  if (diff === 1) {
    return 'Yesterday';
  }
  return `${diff} days ago`;
}

export default function App(): JSX.Element {
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;
  const bottomInset = Platform.OS === 'ios' ? 28 : 16;
  const todayDate = getDateByOffset(0);
  const todayDateKey = dateKeyFromDate(todayDate);
  const yesterdayDateKey = dateKeyFromDate(getDateByOffset(1));
  const twoDaysAgoDateKey = dateKeyFromDate(getDateByOffset(2));

  const { points, isLoading, isRecording, permissionState, startRecording, stopRecording } = usePathRecorder();

  const [activeView, setActiveView] = useState<ActiveView>({
    type: 'date',
    dateKey: todayDateKey,
    title: 'Today',
  });
  const [isMoreVisible, setIsMoreVisible] = useState(false);

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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.screen}>
        <PathMapCard
          coordinates={coordinates}
          lineColor={lineColor}
          permissionGranted={permissionState === 'granted'}
          isLoading={isLoading}
        />

        <View style={[styles.header, { paddingTop: topInset + 16 }]}>
          <View style={styles.headerLeft}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconArrow}>➤</Text>
            </View>
            <Text style={styles.appTitle}>PathTracker</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => setActiveView({ type: 'footprint' })}
              style={[
                styles.headerBtn,
                activeView.type === 'footprint' ? styles.headerBtnActive : undefined,
              ]}
            >
              <Text style={styles.headerBtnText}>★</Text>
            </Pressable>
            <Pressable onPress={() => setIsMoreVisible(true)} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>↗</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.topMenuRow, { top: topInset + 62 }]}>
          <Pressable
            onPress={() => setActiveView({ type: 'footprint' })}
            style={[
              styles.menuItem,
              activeView.type === 'footprint' ? styles.menuItemActive : styles.menuItemInactive,
            ]}
          >
            <Text
              style={[
                styles.menuItemText,
                activeView.type === 'footprint' ? styles.menuItemTextActive : styles.menuItemTextInactive,
              ]}
            >
              Footprint
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveView({ type: 'date', dateKey: todayDateKey, title: 'Today' })}
            style={[
              styles.menuItem,
              activeView.type === 'date' && activeView.dateKey === todayDateKey
                ? styles.menuItemActive
                : styles.menuItemInactive,
            ]}
          >
            <Text
              style={[
                styles.menuItemText,
                activeView.type === 'date' && activeView.dateKey === todayDateKey
                  ? styles.menuItemTextActive
                  : styles.menuItemTextInactive,
              ]}
            >
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveView({ type: 'date', dateKey: yesterdayDateKey, title: 'Yesterday' })}
            style={[
              styles.menuItem,
              activeView.type === 'date' && activeView.dateKey === yesterdayDateKey
                ? styles.menuItemActive
                : styles.menuItemInactive,
            ]}
          >
            <Text
              style={[
                styles.menuItemText,
                activeView.type === 'date' && activeView.dateKey === yesterdayDateKey
                  ? styles.menuItemTextActive
                  : styles.menuItemTextInactive,
              ]}
            >
              Yesterday
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveView({ type: 'date', dateKey: twoDaysAgoDateKey, title: '2 days ago' })}
            style={[
              styles.menuItem,
              activeView.type === 'date' && activeView.dateKey === twoDaysAgoDateKey
                ? styles.menuItemActive
                : styles.menuItemInactive,
            ]}
          >
            <Text
              style={[
                styles.menuItemText,
                activeView.type === 'date' && activeView.dateKey === twoDaysAgoDateKey
                  ? styles.menuItemTextActive
                  : styles.menuItemTextInactive,
              ]}
            >
              2 days ago
            </Text>
          </Pressable>
        </View>

        {displayedPoints.length === 0 ? (
          <Text style={[styles.noPathText, { bottom: bottomInset + 155 }]}>
            No path recorded for {viewLabel(activeView)}
          </Text>
        ) : null}

        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.50)', 'rgba(255,255,255,0.90)', 'rgba(255,255,255,0.97)']}
          locations={[0, 0.65, 0.85, 1]}
          style={[styles.bottomArea, { paddingBottom: bottomInset + 24 }]}
        >
          <RecordingControls isRecording={isRecording} onStart={startRecording} onStop={stopRecording} />
        </LinearGradient>
      </View>

      <MoreDatesModal
        visible={isMoreVisible}
        onClose={() => setIsMoreVisible(false)}
        olderDateKeys={olderDateKeys}
        activeView={activeView}
        onSelectDate={(dateKey, title) => setActiveView({ type: 'date', dateKey, title })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  appIconArrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    transform: [{ rotate: '-45deg' }],
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerBtnActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.20)',
  },
  headerBtnText: {
    fontSize: 15,
    color: '#555555',
    fontWeight: '700',
  },
  topMenuRow: {
    position: 'absolute',
    left: 18,
    right: 18,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItem: {
    minHeight: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  menuItemInactive: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  menuItemActive: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuItemTextInactive: {
    color: 'rgba(0,0,0,0.28)',
  },
  menuItemTextActive: {
    color: '#ffffff',
  },
  noPathText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 30,
    color: 'rgba(0,0,0,0.25)',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
});
