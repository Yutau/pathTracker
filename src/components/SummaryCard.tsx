import { StyleSheet, Text, View } from 'react-native';

import type { PathPoint } from '../types/path';
import { formatClock } from '../utils/date';

type SummaryCardProps = {
  viewTitle: string;
  displayedPoints: PathPoint[];
  summaryDistance: number;
  statusMessage: string;
};

export function SummaryCard({
  viewTitle,
  displayedPoints,
  summaryDistance,
  statusMessage,
}: SummaryCardProps): JSX.Element {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle} numberOfLines={1}>
        {viewTitle}
      </Text>
      {displayedPoints.length === 0 ? (
        <Text style={styles.summaryBody}>No recorded points for this view yet</Text>
      ) : (
        <View style={styles.summaryStats}>
          <Text style={styles.summaryBody}>
            {displayedPoints.length} points · {summaryDistance.toFixed(2)} km
          </Text>
          <Text style={styles.summaryMeta}>
            Last: {formatClock(displayedPoints[displayedPoints.length - 1].timestamp)}
          </Text>
        </View>
      )}
      <Text style={styles.summaryHint} numberOfLines={1}>
        {statusMessage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.44)',
  },
  summaryTitle: {
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '700',
  },
  summaryStats: {
    marginTop: 7,
    gap: 2,
  },
  summaryBody: {
    marginTop: 5,
    color: '#e2e8f0',
    fontSize: 13,
  },
  summaryMeta: {
    color: '#cbd5e1',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  summaryHint: {
    marginTop: 8,
    color: '#cbd5e1',
    fontSize: 11,
  },
});
