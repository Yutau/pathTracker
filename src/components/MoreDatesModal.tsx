import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ActiveView } from '../types/path';
import { formatLongDate } from '../utils/date';

type MoreDatesModalProps = {
  visible: boolean;
  onClose: () => void;
  olderDateKeys: string[];
  activeView: ActiveView;
  onSelectDate: (dateKey: string, title: string) => void;
};

/**
 * Bottom-sheet modal for selecting dates older than the quick tab range.
 */
export function MoreDatesModal({
  visible,
  onClose,
  olderDateKeys,
  activeView,
  onSelectDate,
}: MoreDatesModalProps): JSX.Element {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {/* Backdrop closes the modal on tap outside the sheet. */}
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Older Paths (More)</Text>
          {olderDateKeys.length === 0 ? (
            <Text style={styles.modalEmpty}>No paths older than 3 days yet.</Text>
          ) : (
            <FlatList
              data={olderDateKeys}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                // Highlight currently selected date for orientation.
                const isActive = activeView.type === 'date' && activeView.dateKey === item;
                return (
                  <Pressable
                    style={[styles.modalItem, isActive && styles.modalItemActive]}
                    onPress={() => {
                      onSelectDate(item, 'Earlier');
                      onClose();
                    }}
                  >
                    <Text style={[styles.modalItemText, isActive && styles.modalItemTextActive]}>
                      {formatLongDate(item)}
                    </Text>
                  </Pressable>
                );
              }}
            />
          )}
          <Pressable style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
  },
  modalSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 26,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.22)',
  },
  modalTitle: {
    fontSize: 18,
    color: '#f8fafc',
    fontWeight: '700',
  },
  modalEmpty: {
    marginTop: 14,
    color: '#cbd5e1',
  },
  modalItem: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.22)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalItemActive: {
    borderColor: '#f97316',
    backgroundColor: 'rgba(251, 146, 60, 0.22)',
  },
  modalItemText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  modalItemTextActive: {
    color: '#ffedd5',
    fontWeight: '700',
  },
  modalCloseButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#ff8a00',
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff8ec',
    fontWeight: '700',
  },
});
