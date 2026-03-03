import { ScrollView, StyleSheet } from 'react-native';

import type { ActiveView, DateMenuItem } from '../types/path';
import { formatShortDate } from '../utils/date';
import { MenuButton } from './MenuButton';

type PathMenuProps = {
  activeView: ActiveView;
  todayDate: Date;
  todayDateKey: string;
  previousDayMenus: DateMenuItem[];
  olderDateCount: number;
  onSelectFootprint: () => void;
  onSelectDate: (dateKey: string, title: string) => void;
  onPressMore: () => void;
};

export function PathMenu({
  activeView,
  todayDate,
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
        label={`Today · ${formatShortDate(todayDate)}`}
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

      <MenuButton
        label={olderDateCount > 0 ? `More (${olderDateCount})` : 'More'}
        active={false}
        onPress={onPressMore}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menuScroll: {
    marginTop: 14,
    maxHeight: 46,
  },
  menuRow: {
    paddingRight: 6,
    alignItems: 'center',
    gap: 8,
  },
});
