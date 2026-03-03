import { Pressable, StyleSheet, Text } from 'react-native';

type MenuButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function MenuButton({ label, active, onPress }: MenuButtonProps): JSX.Element {
  return (
    <Pressable onPress={onPress} style={[styles.menuButton, active && styles.menuButtonActive]}>
      <Text style={[styles.menuButtonText, active && styles.menuButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  menuButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#115e59',
  },
  menuButtonText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  menuButtonTextActive: {
    color: '#ffffff',
  },
});
