import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type RecordingControlsProps = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
};

/**
 * Single primary call-to-action button.
 * Keeps interaction simple: one button toggles between start and stop.
 */
export function RecordingControls({ isRecording, onStart, onStop }: RecordingControlsProps): JSX.Element {
  // Toggle target action based on current recording state.
  const onPressMain = isRecording ? onStop : onStart;

  return (
    <View style={styles.controlsWrap}>
      <Pressable onPress={onPressMain} style={styles.mainButton} accessibilityRole="button">
        {/* Gradient closely follows the design reference from the provided HTML. */}
        <LinearGradient colors={['#f9a825', '#f97316', '#ea580c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mainButtonGradient}>
          <View style={styles.playCircle}>
            <Text style={styles.playIcon}>{isRecording ? '■' : '▶'}</Text>
          </View>
          {/* Button label reflects current action, not current state. */}
          <Text style={styles.mainButtonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsWrap: {
    width: '100%',
  },
  mainButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  mainButtonGradient: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
  },
  mainButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
});
