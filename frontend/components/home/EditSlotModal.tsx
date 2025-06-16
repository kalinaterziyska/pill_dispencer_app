import React, { useState, useEffect } from 'react';
import { View, Modal, Button, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Slot, Schedule, weekdayMap } from '@/types/dispenser';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker, { DateTimePickerEvent, DateTimePickerAndroid } from '@react-native-community/datetimepicker';

// A custom styled TextInput for consistency
const ThemedInput = (props: any) => (
  <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
);

interface EditSlotModalProps {
  isVisible: boolean;
  onClose: (needsRefresh: boolean) => void;
  onUpdate: (pillName: string, schedules: Schedule[]) => void;
  slot: Slot | null;
}

export default function EditSlotModal({ isVisible, onClose, onUpdate, slot }: EditSlotModalProps) {
  const [pillName, setPillName] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);

  useEffect(() => {
    if (slot) {
      setPillName(slot.pill_name);
      setSchedules(Array.isArray(slot.schedules) ? slot.schedules.map(s => ({ ...s })) : []);
    } else {
      setPillName('');
      setSchedules([]);
    }
  }, [slot]);

  const handleUpdate = () => {
    if (slot) {
      onUpdate(pillName, schedules);
      onClose(true);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
        setEditingScheduleIndex(null);
    }

    if (event.type === 'set' && selectedDate && editingScheduleIndex !== null) {
      const newSchedules = [...schedules];
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      newSchedules[editingScheduleIndex].time = `${hours}:${minutes}:00`;
      setSchedules(newSchedules);
    }
  };
  
  const showTimepickerFor = (index: number) => {
    setEditingScheduleIndex(index);
    if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
            value: getTimePickerValue(),
            onChange: onTimeChange,
            mode: 'time',
            is24Hour: true,
        });
    }
  }

  const handleWeekdaySelect = (scheduleIndex: number, day: number) => {
    const newSchedules = [...schedules];
    newSchedules[scheduleIndex].weekday = day;
    setSchedules(newSchedules);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { time: '12:00:00', weekday: 1 }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const getTimePickerValue = () => {
    if (editingScheduleIndex !== null && schedules[editingScheduleIndex]?.time) {
      const timeParts = schedules[editingScheduleIndex].time.split(':');
      const date = new Date();
      date.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), parseInt(timeParts[2] || '0', 10));
      return date;
    }
    return new Date();
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      presentationStyle="pageSheet"
      onRequestClose={() => onClose(false)}
    >
      <ThemedView style={styles.modalView}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <ThemedText style={styles.title}>Edit Slot {slot?.slot_number}</ThemedText>

          <ThemedText style={styles.label}>Pill Name</ThemedText>
          <ThemedInput value={pillName} onChangeText={setPillName} placeholder="e.g., Ibuprofen" />

          <View style={styles.schedulesHeader}>
            <ThemedText style={styles.label}>Schedules</ThemedText>
            <Button title="Add New" onPress={addSchedule} />
          </View>

          {schedules.map((schedule, index) => (
            <View key={index} style={styles.scheduleContainer}>
              {editingScheduleIndex === index && Platform.OS !== 'android' ? (
                <View>
                  <DateTimePicker
                    value={getTimePickerValue()}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                    textColor={Platform.OS === 'ios' ? 'white' : undefined}
                    style={Platform.OS === 'web' ? styles.webDatePicker : {}}
                  />
                  <Button title="Done" onPress={() => setEditingScheduleIndex(null)} />
                </View>
              ) : (
                <View style={styles.scheduleRow}>
                  <TouchableOpacity onPress={() => showTimepickerFor(index)} style={styles.timeButton}>
                    <ThemedText style={styles.timeText}>{schedule.time.substring(0, 5)}</ThemedText>
                  </TouchableOpacity>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekdayScroller}>
                    {Object.entries(weekdayMap).map(([dayNumber, dayName]) => (
                      <TouchableOpacity 
                        key={dayNumber} 
                        style={[styles.weekdayButton, schedule.weekday === parseInt(dayNumber) && styles.weekdaySelected]}
                        onPress={() => handleWeekdaySelect(index, parseInt(dayNumber))}
                      >
                        <ThemedText style={[styles.weekdayText, schedule.weekday === parseInt(dayNumber) && styles.weekdayTextSelected]}>{dayName}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity onPress={() => removeSchedule(index)} style={styles.deleteButton}>
                    <IconSymbol name="trash" size={20} color="#888" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.updateButton]} onPress={handleUpdate}>
            <ThemedText style={styles.actionButtonText}>Update Slot</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => onClose(false)}>
            <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#1C1C1E', // Dark background for consistency
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#fff',
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: 'white'
  },
  schedulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white'
  },
  weekdayScroller: {
    flex: 1,
    marginHorizontal: 10,
  },
  weekdayButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#3A3A3C',
  },
  weekdaySelected: {
    backgroundColor: '#645273',
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white'
  },
  weekdayTextSelected: {
    color: 'white',
  },
  deleteButton: {
    padding: 10,
  },
  webDatePicker: {
    height: 50,
    width: '100%',
    backgroundColor: '#3A3A3C',
    color: 'white',
    borderRadius: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#645273',
  },
  cancelButton: {
    backgroundColor: '#645273',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 