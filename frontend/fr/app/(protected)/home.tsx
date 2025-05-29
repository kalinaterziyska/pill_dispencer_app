import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export interface Schedule {
  // e.g. id: number;
  //      time: string;
}

/** One physical slot inside the dispenser. */
export interface Slot {
  id: number;          // 13, 14, 15, 16, …
  dispenser: number;   // always matches the parent container’s id (5 here)
  slot_number: number; // 1 … 4
  name: string;   // "Empty Slot 1", …
  schedules: Schedule[];
}

/** The top-level container returned by ContainerSerializer. */
export interface Container {
  id: number;        // 5
  name: string;      // "container2"
  owner: string;     // "toni"
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
  const [error, setError] = useState<string| null>(null);

  useEffect(() => {
    async function loadContainers() {
      try {
        const headers: HeadersInit = {
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    
        const res = await fetch( 'http://localhost:8000/api/list-all-user-dispensers/',{ headers });
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
        {containers.map((step, i) => (
          <ThemedView key={i} style={styles.stepContainer}>
            <ThemedText style={styles.stepText}>{step.name || `Container ${step.id}`}</ThemedText>
            <Image source={require('@/assets/images/microwave.avif')} style={styles.stepImage} />
          </ThemedView>
        ))}
      </ThemedView>


      {/* <ScrollView
        contentContainerStyle={styles.containerList}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {containers.map((c) => (
          <ThemedView key={c.id} style={styles.stepContainer}>
            <ThemedText type="subtitle">{c.name || `Container ${c.id}`}</ThemedText>
            <Image
              source={require('@/assets/images/microwave.avif')}
              style={styles.stepImage}
              resizeMode="contain"
            />
          </ThemedView>
        ))}
      </ScrollView> */}
    </ParallaxScrollView>
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
    gap:  40
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
    backgroundColor: '#eee',
  },
  kittyImage: {
    width: 450,
    position: 'static',
    bottom: 0,
    left: 0,
  },
});


