import { Pressable, StyleSheet, Text, View } from 'react-native';

type RecordingControlsProps = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function RecordingControls({ isRecording, onStart, onStop }: RecordingControlsProps): JSX.Element {
  return (
    <View style={styles.controlsRow}>
      <Pressable
        onPress={onStart}
        disabled={isRecording}
        style={[styles.controlButton, styles.startButton, isRecording && styles.controlButtonDisabled]}
      >
        <Text style={styles.controlButtonText}>Start Recording</Text>
      </Pressable>
      <Pressable
        onPress={onStop}
        disabled={!isRecording}
        style={[styles.controlButton, styles.stopButton, !isRecording && styles.controlButtonDisabled]}
      >
        <Text style={styles.controlButtonText}>Stop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#0f766e',
  },
  stopButton: {
    backgroundColor: '#9f1239',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
