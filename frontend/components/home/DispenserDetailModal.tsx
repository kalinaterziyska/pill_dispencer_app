import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, StyleSheet, Button } from 'react-native';
import { Image } from 'expo-image';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Container, Slot, Schedule, weekdayMap } from '@/types/dispenser';
import EditSlotModal from './EditSlotModal';

interface DispenserDetailModalProps {
  visible: boolean;
  container: Container | null;
  onClose: () => void;
  onUpdateSlot: (slot: Slot, pillName: string, schedules: Schedule[]) => Promise<void>;
}

export default function DispenserDetailModal({ visible, container, onClose, onUpdateSlot }: DispenserDetailModalProps) {
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  const handleOpenEditSlot = (slot: Slot) => {
    setEditingSlot(slot);
  };
  
  const handleCloseEditSlot = () => {
    setEditingSlot(null);
  };

  if (!container) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
          headerImage={
            <Image source={require('@/assets/images/microwave.avif')} style={styles.headerImage} />
          }
        >
          <TouchableOpacity 
            style={[styles.backButton, { paddingLeft: 0 }]}
            onPress={onClose}
          >
            {/* Using text instead of icon for reliability */}
            <ThemedText>Back</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title">{container.name || `Container ${container.id}`}</ThemedText>
          
          <ThemedText>ID: {container.id}</ThemedText>

          <ThemedView style={styles.schedulesContainer}>
            <ThemedText type="subtitle">Slots & Schedules</ThemedText>
            {container.containers?.map((slot) => (
              <ThemedView key={slot.id} style={styles.scheduleItem}>
                <View style={styles.slotHeader}>
                  <ThemedText style={styles.slotTitle}>{slot.name || `Slot ${slot.slot_number}`}</ThemedText>
                  <Button title="Edit" onPress={() => handleOpenEditSlot(slot)} />
                </View>
                {slot.schedules?.length > 0 ? (
                  slot.schedules.map((schedule: Schedule, index: number) => (
                    <ThemedText key={index} style={styles.scheduleText}>
                      {schedule.weekday ? `${weekdayMap[schedule.weekday]}: ` : ''}{schedule.time}
                    </ThemedText>
                  ))
                ) : (
                  <ThemedText style={styles.emptyText}>No schedules set</ThemedText>
                )}
              </ThemedView>
            ))}
          </ThemedView>
        </ParallaxScrollView>
      </Modal>

      <EditSlotModal 
        visible={editingSlot !== null}
        slot={editingSlot}
        onClose={handleCloseEditSlot}
        onUpdateSlot={onUpdateSlot}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  schedulesContainer: {
    marginTop: 24,
    gap: 16,
  },
  scheduleItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  slotTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scheduleText: {
    fontSize: 16,
    color: '#645273',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
}); 