import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../AuthContext';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Container = {
  id: number;
  // adjust these fields to match your ContainerSerializer output:
  name: string;
  owner: string;
  //containers: ;
};

export default function HomeScreen() {
  const { token } = useAuth();                    // assume you have a hook to get the JWT or session token
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string| null>(null);

  useEffect(() => {
    async function loadContainers() {
      try {
        const res = await fetch(
          'http://127.0.0.1:8000/api/list-all-user-dispensers/',  // have to edit
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        );
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const dispensers = await res.json() as Array<{
          id: number;
          name: string;
          containers: Container[];
        }>;

        // flatten all containers across all dispensers:
        const allContainers = dispensers.flatMap(d => d.containers);
        setContainers(allContainers);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Unknown error');
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
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Your Containers</ThemedText>
      </ThemedView>

      <ScrollView
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
      </ScrollView>
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
    paddingHorizontal: 16,
  },
  stepContainer: {
    width: 200,
    marginRight: 16,
    alignItems: 'center',
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  stepImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
});
