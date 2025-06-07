import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function MyPage() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/'); // rerout to  login
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
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
        <ThemedText type="title">Your Profile</ThemedText>
      </ThemedView>
      <TouchableOpacity 
        style={[
          styles.exitButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint }
        ]} 
        onPress={handleLogout}
      >
      <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#fff" />
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  text: {
    fontSize: 20, 
    marginBottom: 20,
    color: '#645273',
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
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    marginTop: 24,
    gap: 8,
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
  exitButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
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
