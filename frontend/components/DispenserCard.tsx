import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/IconSymbol';
import { Container } from '@/types/dispenser';
import { ThemedView } from './ThemedView';
import { Image } from 'expo-image';

interface DispenserCardProps {
  dispenser: Container;
  onPress: () => void;
}

export function DispenserCard({ dispenser, onPress }: DispenserCardProps) {
  return (
    <ThemedView style={styles.card}>
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <View style={styles.detailsColumn}>
            <View style={styles.header}>
            <IconSymbol name="database" size={24} color="#fff" />
            <ThemedText style={styles.title}>{dispenser.name}</ThemedText>
            </View>
            <ThemedText style={styles.serial}>ID: {dispenser.id}</ThemedText>
            <View style={styles.footer}>
                <ThemedText style={styles.slotInfo}>
                    {dispenser.containers?.length || 0} slots configured
                </ThemedText>
            </View>
        </View>
        <View style={styles.imageColumn}>
            <Image source={require('@/assets/images/microwave.avif')} style={styles.dispenserImage} />
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#2C2C2E',
  },
  touchable: {
    flexDirection: 'row',
    padding: 20,
  },
  detailsColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageColumn: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  dispenserImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  serial: {
    fontSize: 14,
    color: '#AEAEB2',
    marginBottom: 10,
  },
  footer: {
    marginTop: 'auto', // Pushes footer to the bottom
  },
  slotInfo: {
    fontSize: 14,
    color: '#AEAEB2',
  },
}); 