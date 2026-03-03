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
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 26,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '700',
  },
  modalEmpty: {
    marginTop: 14,
    color: '#64748b',
  },
  modalItem: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  modalItemActive: {
    borderColor: '#0f766e',
    backgroundColor: '#ccfbf1',
  },
  modalItemText: {
    color: '#0f172a',
    fontSize: 14,
  },
  modalItemTextActive: {
    color: '#115e59',
    fontWeight: '700',
  },
  modalCloseButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
