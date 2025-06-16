import React, { useState } from 'react';
import { Modal, View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Container, Slot } from '@/types/dispenser';
import { useAuth } from '@/context/AuthContext';
import EditSlotModal from './EditSlotModal';
import { ThemedText } from '../ThemedText';
import ScheduleCard from './ScheduleCard';
import { ThemedView } from '../ThemedView';
import { API_BASE_URL } from '@/constants/api';

interface DispenserDetailModalProps {
  container: Container | null;
  isVisible: boolean;
  onClose: () => void;
  onDataNeedsRefresh: () => void;
  onDeleteContainer: (containerId: number) => Promise<void>;
}

export default function DispenserDetailModal({
  container,
  isVisible,
  onClose,
  onDataNeedsRefresh,
  onDeleteContainer,
}: DispenserDetailModalProps) {
  const [editSlotModalVisible, setEditSlotModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const auth = useAuth();

  const handleModalClose = () => {
    if (needsRefresh) {
      onDataNeedsRefresh();
    }
    onClose();
  };

  const handleEditSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setEditSlotModalVisible(true);
  };

  const handleCloseEditSlot = (refresh: boolean) => {
    setEditSlotModalVisible(false);
    setSelectedSlot(null);
    if (refresh) {
      setNeedsRefresh(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!container) return;
    Alert.alert(
      "Delete Dispenser",
      `Are you sure you want to permanently delete "${container.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDelete() }
      ]
    );
  };

  const handleDelete = async () => {
    if (!container) return;
    try {
      await onDeleteContainer(container.id);
      setNeedsRefresh(true);
      handleModalClose();
    } catch (error) {
      Alert.alert("Error", "Failed to delete dispenser. Please try again.");
    }
  };

  if (!container) return null;

  const renderSlots = () => (
    container.containers?.map((slot: Slot) => (
      <View key={slot.id}>
        <ScheduleCard slot={slot} />
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditSlot(slot)}>
          <FontAwesome name="pencil" size={16} color="white" />
          <ThemedText style={styles.editButtonText}>Edit Slot Details</ThemedText>
        </TouchableOpacity>
      </View>
    ))
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleModalClose}
    >
      <View style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
            <FontAwesome name="times" size={24} color="#888" />
          </TouchableOpacity>
          <ScrollView>
            <View style={styles.contentContainer}>
              <ThemedText style={styles.title}>{container.name}</ThemedText>
              <ThemedText style={styles.subtitle}>Owner: {container.owner}</ThemedText>
              
              <ThemedText style={styles.sectionTitle}>Schedules</ThemedText>
              {renderSlots()}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.deleteButton} onPress={handleConfirmDelete}>
            <FontAwesome name="trash" size={18} color="#FF453A" />
            <ThemedText style={styles.deleteButtonText}>Delete Dispenser</ThemedText>
          </TouchableOpacity>
          
          {selectedSlot && container && (
            <EditSlotModal 
              isVisible={editSlotModalVisible}
              slot={selectedSlot}
              onClose={handleCloseEditSlot}
              onUpdate={async (pillName, schedules) => {
                if (!auth || !auth.token) {
                  Alert.alert("Authentication Error", "You are not logged in.");
                  return;
                }
                const url = `${API_BASE_URL}/api/container-schedule/`;
                try {
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${auth.token}`
                        },
                        body: JSON.stringify({
                            dispenser_name: container.name,
                            slot_number: selectedSlot.slot_number,
                            pill_name: pillName,
                            schedules: schedules.map(({ weekday, time }) => ({ weekday, time })),
                        })
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || 'Failed to update slot');
                    }
                    handleCloseEditSlot(true);
                } catch(e) {
                    const error = e as Error;
                    Alert.alert('Update Failed', error.message);
                }
              }}
            />
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    width: '90%',
    height: '85%',
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  contentContainer: {
    paddingTop: 30, // Space for the close button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E5E5EA',
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginTop: -12,
    marginBottom: 24,
    alignSelf: 'center',
    width: '60%',
  },
  editButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
  },
  deleteButtonText: {
    color: '#FF453A',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 