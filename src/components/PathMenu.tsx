import { ScrollView, StyleSheet } from 'react-native';

import type { ActiveView, DateMenuItem } from '../types/path';
import { MenuButton } from './MenuButton';

type PathMenuProps = {
  activeView: ActiveView;
  todayDateKey: string;
  previousDayMenus: DateMenuItem[];
  onSelectFootprint: () => void;
  onSelectDate: (dateKey: string, title: string) => void;
  onPressMore: () => void;
};

export function PathMenu({
  activeView,
  todayDateKey,
  previousDayMenus,
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

      <MenuButton label="More" active={false} onPress={onPressMore} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menuScroll: {
    maxHeight: 40,
  },
  menuRow: {
    paddingRight: 14,
    alignItems: 'center',
    gap: 14,
    paddingVertical: 2,
  },
});
