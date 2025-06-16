import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Slot, weekdayMap } from '@/types/dispenser';
import { FontAwesome } from '@expo/vector-icons';

interface ScheduleCardProps {
  slot: Slot;
}

export default function ScheduleCard({ slot }: ScheduleCardProps) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.cardTitle}>{slot.pill_name || `Slot ${slot.slot_number}`}</ThemedText>
      <View style={styles.schedulesContainer}>
        {slot.schedules && slot.schedules.length > 0 ? (
          slot.schedules.map((schedule, index) => (
            <View key={index} style={styles.scheduleRow}>
              <View style={styles.timeContainer}>
                <FontAwesome name="clock-o" size={20} color="#8A8A8E" />
                <ThemedText style={styles.timeText}>{schedule.time.substring(0, 5)}</ThemedText>
              </View>
              <View style={styles.weekdayContainer}>
                {Object.entries(weekdayMap).map(([dayNumber, dayInitial]) => (
                  <View 
                    key={dayNumber} 
                    style={[
                      styles.dayBubble, 
                      schedule.weekday === parseInt(dayNumber, 10) && styles.dayBubbleActive
                    ]}
                  >
                    <ThemedText 
                      style={[
                        styles.dayText,
                        schedule.weekday === parseInt(dayNumber, 10) && styles.dayTextActive
                      ]}
                    >
                      {dayInitial.charAt(0)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <ThemedText style={styles.noSchedulesText}>No schedules set for this slot.</ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  schedulesContainer: {
    // container for all schedule rows
  },
  scheduleRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12,
  },
  weekdayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBubbleActive: {
    backgroundColor: '#A9A9A9',
  },
  dayText: {
    color: '#E5E5EA',
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  noSchedulesText: {
    color: '#8A8A8E',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
}); 