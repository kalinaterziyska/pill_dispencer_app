import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, TouchableOpacity, View, Button } from 'react-native';
import { Image } from 'expo-image';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/types/dispenser';

import { useDispensers } from '@/hooks/useDispensers';
import AddDispenserModal from '@/components/home/AddDispenserModal';
import DispenserDetailModal from '@/components/home/DispenserDetailModal';

export default function HomeScreen() {
  const { 
    containers, 
    loading, 
    error, 
    loadContainers, 
    addContainer, 
    updateSlot,
    setError 
  } = useDispensers();
  
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const handleUpdateSlot = async (slot: any, pillName: string, schedules: any) => {
    if (!selectedContainer) return;
    await updateSlot(selectedContainer.name, slot, pillName, schedules);
  };

  if (loading && containers.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading your containers…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
        headerImage={
          <Image
            source={require('@/assets/images/kitty-removebg-preview1.png')}
            style={styles.kittyImage}
          />
        }>
        <View style={styles.mainContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Your Containers</ThemedText>
          </ThemedView>

          {error && (
            <ThemedView style={styles.errorContainer}>
              <ThemedText type="error" style={styles.errorText}>{error}</ThemedText>
              <Button title="Retry" onPress={() => { setError(null); loadContainers(); }} />
            </ThemedView>
          )}

          <ThemedView style={styles.containerList}>
            {containers.map((container, i) => (
              <TouchableOpacity
                key={i}
                style={styles.stepContainer}
                onPress={() => setSelectedContainer(container)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.stepText}>{container.name || `Container ${container.id}`}</ThemedText>
                <Image source={require('@/assets/images/microwave.avif')} style={styles.stepImage} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </View>
      </ParallaxScrollView>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
        >
          <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <AddDispenserModal 
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddContainer={addContainer}
      />

      <DispenserDetailModal
        visible={selectedContainer !== null}
        container={selectedContainer}
        onClose={() => setSelectedContainer(null)}
        onUpdateSlot={handleUpdateSlot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    padding: 16,
  },
  containerList: {
    paddingHorizontal: 0,
    flexDirection: "column",
    alignItems: "center",
    gap: 40
  },
  stepContainer: {
    width: 200,
    marginRight: 16,
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 8,
  },
  stepText: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  stepImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  kittyImage: {
    width: 450,
    position: 'static',
    bottom: 0,
    left: 0,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 90,
    right: 32,
    zIndex: 1000,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#645273',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});


