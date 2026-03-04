import { Pressable, StyleSheet, Text } from 'react-native';

type MenuButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function MenuButton({ label, active, onPress }: MenuButtonProps): JSX.Element {
  return (
    <Pressable
      hitSlop={6}
      onPress={onPress}
      style={[styles.menuButton, active ? styles.menuButtonActive : styles.menuButtonInactive]}
    >
      <Text style={[styles.menuButtonText, active && styles.menuButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    borderRadius: 999,
    minHeight: 44,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonInactive: {
    paddingHorizontal: 0,
  },
  menuButtonActive: {
    backgroundColor: '#ff8a00',
    paddingHorizontal: 30,
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 7,
  },
  menuButtonText: {
    color: 'rgba(241, 245, 249, 0.66)',
    fontSize: 17,
    fontWeight: '600',
  },
  menuButtonTextActive: {
    color: '#fff8ec',
    fontWeight: '700',
  },
});
