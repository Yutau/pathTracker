import { Pressable, StyleSheet, Text, View } from 'react-native';

type RecordingControlsProps = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function RecordingControls({ isRecording, onStart, onStop }: RecordingControlsProps): JSX.Element {
  const onPressMain = isRecording ? onStop : onStart;

  return (
    <View style={styles.controlsWrap}>
      <Pressable
        onPress={onPressMain}
        style={[styles.mainButton, isRecording && styles.mainButtonActiveRecording]}
      >
        <View style={styles.playCircle}>
          <Text style={styles.playIcon}>{isRecording ? '■' : '▶'}</Text>
        </View>
        <Text style={styles.mainButtonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsWrap: {
    alignItems: 'center',
  },
  mainButton: {
    minWidth: 260,
    maxWidth: 380,
    width: '78%',
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 22,
    backgroundColor: '#ff8a00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.34,
    shadowRadius: 15,
    elevation: 9,
  },
  mainButtonActiveRecording: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.23)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#fff8ec',
    fontSize: 13,
    fontWeight: '700',
  },
  mainButtonText: {
    color: '#fff8ec',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
});
