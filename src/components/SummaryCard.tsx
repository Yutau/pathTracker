import { StyleSheet, Text, View } from 'react-native';

import type { PathPoint } from '../types/path';
import { formatClock } from '../utils/date';

type SummaryCardProps = {
  viewTitle: string;
  displayedPoints: PathPoint[];
  summaryDistance: number;
};

export function SummaryCard({ viewTitle, displayedPoints, summaryDistance }: SummaryCardProps): JSX.Element {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>{viewTitle}</Text>
      {displayedPoints.length === 0 ? (
        <Text style={styles.summaryBody}>No recorded points for this view yet.</Text>
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
      <Text style={styles.summaryHint}>Location access must be allowed while the app is in use.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffffee',
  },
  summaryTitle: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '700',
  },
  summaryStats: {
    marginTop: 6,
    gap: 2,
  },
  summaryBody: {
    marginTop: 6,
    color: '#1f2937',
    fontSize: 14,
  },
  summaryMeta: {
    color: '#475569',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  summaryHint: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 12,
  },
});
