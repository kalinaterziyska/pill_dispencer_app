import React, { useState, useEffect } from 'react';
import { Modal, TextInput, TouchableOpacity, View, StyleSheet, Button } from 'react-native';
import { Image } from 'expo-image';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Slot, Schedule } from '@/types/dispenser';

interface EditSlotModalProps {
  visible: boolean;
  slot: Slot | null;
  onClose: () => void;
  onUpdateSlot: (slot: Slot, pillName: string, schedules: Schedule[]) => Promise<void>;
}

export default function EditSlotModal({ visible, slot, onClose, onUpdateSlot }: EditSlotModalProps) {
  const [pillName, setPillName] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (slot) {
      setPillName(slot.name);
      setSchedules(slot.schedules.map(s => ({ ...s })));
    }
  }, [slot]);

  const handleUpdate = async () => {
    if (!slot) return;
    try {
      await onUpdateSlot(slot, pillName, schedules);
      onClose();
    } catch (err: any) {
      console.error(err.message);
      // Optionally set an error state to display in the modal
    }
  };

  if (!slot) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
        headerImage={
          <Image
            source={require('@/assets/images/kitty-removebg-preview1.png')}
            style={styles.kittyImage}
          />
        }
      >
        <ThemedView style={styles.formContainer}>
          <ThemedText type="title">Edit Slot {slot.slot_number}</ThemedText>
          
          <ThemedText style={styles.label}>Pill Name</ThemedText>
          <TextInput
            style={styles.input}
            value={pillName}
            onChangeText={setPillName}
            placeholderTextColor="#999"
          />

          <ThemedText style={styles.label}>Schedules</ThemedText>
          {schedules.map((schedule, index) => (
            <View key={index} style={styles.scheduleInputContainer}>
              <TextInput
                style={styles.scheduleInput}
                value={schedule.time}
                onChangeText={(time) => {
                  const newSchedules = [...schedules];
                  newSchedules[index].time = time;
                  setSchedules(newSchedules);
                }}
                placeholder="Time (HH:MM:SS)"
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.scheduleInput, { flex: 0.5 }]}
                value={schedule.weekday?.toString() ?? ''}
                onChangeText={(day) => {
                  const newSchedules = [...schedules];
                  newSchedules[index].weekday = parseInt(day, 10) || undefined;
                  setSchedules(newSchedules);
                }}
                placeholder="Day"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                onPress={() => {
                  const newSchedules = schedules.filter((_, i) => i !== index);
                  setSchedules(newSchedules);
                }}
                style={styles.deleteButton}
              >
                <ThemedText style={{ color: 'white' }}>Del</ThemedText>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.modalButton, { marginTop: 10, backgroundColor: '#5a5a5a' }]}
            onPress={() => {
              setSchedules([...schedules, { time: '12:00:00', weekday: 1 }]);
            }}
          >
            <ThemedText style={styles.modalButtonText}>Add Schedule</ThemedText>
          </TouchableOpacity>
          
          <View style={{ marginTop: 30, width: '100%' }}>
            <TouchableOpacity style={styles.modalButton} onPress={handleUpdate}>
              <ThemedText style={styles.modalButtonText}>Save Changes</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: 'transparent', marginTop: 10 }]}
              onPress={onClose}
            >
              <ThemedText style={{ color: '#aaa' }}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ParallaxScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
    kittyImage: {
      width: 450,
      position: 'static',
      bottom: 0,
      left: 0,
    },
    formContainer: {
      alignItems: 'center',
    },
    input: {
      height: 50,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: '#555',
      backgroundColor: '#333',
      color: 'white',
      padding: 15,
      width: '100%',
      borderRadius: 10,
    },
    label: {
      alignSelf: 'flex-start',
      marginBottom: -5,
      marginTop: 15,
      fontSize: 16,
    },
    scheduleInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 5,
    },
    scheduleInput: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#555',
        backgroundColor: '#333',
        color: 'white',
        padding: 10,
        borderRadius: 10,
    },
    deleteButton: {
      backgroundColor: '#e53935',
      paddingHorizontal: 15,
      height: 50,
      justifyContent: 'center',
      borderRadius: 10,
    },
    modalButton: {
      backgroundColor: '#645273',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      marginTop: 10,
      width: '100%',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    modalButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
}); 