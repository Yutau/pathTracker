import { ScrollView, StyleSheet } from 'react-native';

import type { ActiveView, DateMenuItem } from '../types/path';
import { MenuButton } from './MenuButton';

type PathMenuProps = {
  activeView: ActiveView;
  todayDateKey: string;
  previousDayMenus: DateMenuItem[];
  olderDateCount: number;
  onSelectFootprint: () => void;
  onSelectDate: (dateKey: string, title: string) => void;
  onPressMore: () => void;
};

/**
 * Horizontal quick-access menu:
 * Footprint + Today + recent dates + optional More entry.
 */
export function PathMenu({
  activeView,
  todayDateKey,
  previousDayMenus,
  olderDateCount,
  onSelectFootprint,
  onSelectDate,
  onPressMore,
}: PathMenuProps): JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.menuRow}
      style={styles.menuScroll}
    >
      <MenuButton label="Footprint" active={activeView.type === 'footprint'} onPress={onSelectFootprint} />

      <MenuButton
        label="Today"
        active={activeView.type === 'date' && activeView.dateKey === todayDateKey}
        onPress={() => onSelectDate(todayDateKey, 'Today')}
      />

      {previousDayMenus.map((item) => (
        <MenuButton
          key={item.dateKey}
          label={item.label}
          active={activeView.type === 'date' && activeView.dateKey === item.dateKey}
          onPress={() => onSelectDate(item.dateKey, item.title)}
        />
      ))}

      {/* "More" appears only when there are older days beyond the quick range. */}
      {olderDateCount > 0 ? <MenuButton label="More" active={false} onPress={onPressMore} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menuScroll: {
    maxHeight: 46,
  },
  menuRow: {
    paddingRight: 14,
    alignItems: 'center',
    gap: 20,
    paddingVertical: 2,
  },
});
