import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as SecureStore from 'expo-secure-store';

interface UserData {
  email: string;
  username: string;
  phoneNumber: string;
}

export default function MyPage() {
  const { isLoggedIn, logout, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fetchError, setFetchError] = useState<string>('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) {
          throw new Error('No access token found');
        }

        const response = await fetch('http://localhost:8000/authentication/user/', {
          headers: new Headers({
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (error: unknown) {
        console.error('Fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setFetchError(errorMessage);
      }
    };

    if (!loading) {
      fetchUserData();
    }
  }, [loading, token]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
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
        }
      >
        <View style={styles.mainContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Your Profile</ThemedText>
          </ThemedView>

          <ThemedView style={styles.contentContainer}>
            {fetchError ? (
              <ThemedText style={styles.errorText}>{fetchError}</ThemedText>
            ) : !userData ? (
              <ActivityIndicator size="small" />
            ) : (
              <View style={styles.userInfoContainer}>
                <ThemedText style={styles.userInfoText}>Email: {userData.email}</ThemedText>
                <ThemedText style={styles.userInfoText}>Username: {userData.username}</ThemedText>
                <ThemedText style={styles.userInfoText}>Phone Number: {userData.phoneNumber}</ThemedText>
              </View>
            )}
          </ThemedView>
        </View>
      </ParallaxScrollView>

      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity 
          onPress={handleLogout}
          style={[
            styles.exitButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]} 
        >
          <View style={styles.exitButtonContent}>
            <Text style={styles.exitButtonText}>Log out</Text>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    padding: 16,
  },
  userInfoContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 16,
    color: 'white',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  kittyImage: {
    width: 450,
    position: 'static',
    bottom: 0,
    left: 0,
  },
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    zIndex: 1000,
  },
  exitButton: {
    minWidth: 100,
    height: 40,
    borderRadius: 20,
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
    paddingHorizontal: 16,
  },
  exitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exitButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
});
