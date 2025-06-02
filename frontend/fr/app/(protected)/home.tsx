import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export interface Schedule {
  id?: number;
  time: string;
  weekday?: number;
}

/** One physical slot inside the dispenser. */
export interface Slot {
  id: number;
  dispenser: number;   // always matches the parent container's id
  slot_number: number;
  name: string;
  schedules: Schedule[];
}

/** The top-level container returned by ContainerSerializer. */
export interface Container {
  id: number;
  name: string;
  owner: string;
  containers: Slot[];  // nested array of Slot objects
}

interface DispenserFromApi {
  id: number;
  name: string;
  owner: string;
  containers: Container[];
}

export default function HomeScreen() {
  const { token } = useAuth();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  useEffect(() => {
    async function loadContainers() {
      try {
        const headers: HeadersInit = {
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    
        const res = await fetch('http://localhost:8000/api/list-all-user-dispensers/', { headers });
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data: Container[] = await res.json();
        console.log('loaded containers:', data);
        setContainers(data);

        if (!res.ok) throw new Error(`Server responded ${res.status}`);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadContainers();
  }, [token]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading your containers…</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="error">Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
        headerImage={
          <Image
            source={require('@/assets/images/kitty-removebg-preview1.png')}
            style={styles.kittyImage}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Your Containers</ThemedText>
        </ThemedView>

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
      </ParallaxScrollView>

      <Modal
        visible={selectedContainer !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedContainer(null)}
      >
        {selectedContainer && (
          <ParallaxScrollView
            headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
            headerImage={
              <Image source={require('@/assets/images/microwave.avif')} style={styles.headerImage} />
            }
          >
            <TouchableOpacity 
              style={[styles.backButton, { paddingLeft: 0 }]}
              onPress={() => setSelectedContainer(null)}
            >
              <IconSymbol name="chevron.left" size={24} color="#645273" />
              <ThemedText>Back to Containers</ThemedText>
            </TouchableOpacity>

            <ThemedText type="title">{selectedContainer.name || `Container ${selectedContainer.id}`}</ThemedText>
            
            <ThemedText>ID: {selectedContainer.id}</ThemedText>

            <ThemedView style={styles.schedulesContainer}>
              <ThemedText type="subtitle">Slots & Schedules</ThemedText>
              {selectedContainer.containers?.map((slot) => (
                <ThemedView key={slot.id} style={styles.scheduleItem}>
                  <ThemedText style={styles.slotTitle}>Slot {slot.slot_number}: {slot.name}</ThemedText>
                  {slot.schedules?.length > 0 ? (
                    slot.schedules.map((schedule: Schedule, index: number) => (
                      <ThemedText key={index} style={styles.scheduleText}>
                        {schedule.time}
                      </ThemedText>
                    ))
                  ) : (
                    <ThemedText style={styles.emptyText}>No schedules set</ThemedText>
                  )}
                </ThemedView>
              ))}
            </ThemedView>
          </ParallaxScrollView>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  detailsContainer: {
    marginTop: 24,
    gap: 8,
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


