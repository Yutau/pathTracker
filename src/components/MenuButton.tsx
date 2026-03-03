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
    minHeight: 36,
    paddingVertical: 7,
    justifyContent: 'center',
  },
  menuButtonInactive: {
    paddingHorizontal: 2,
  },
  menuButtonActive: {
    backgroundColor: '#ff8a00',
    paddingHorizontal: 18,
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuButtonText: {
    color: 'rgba(241, 245, 249, 0.60)',
    fontSize: 13,
    fontWeight: '600',
  },
  menuButtonTextActive: {
    color: '#fff8ec',
    fontWeight: '700',
  },
});
