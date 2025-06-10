import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Do nothing while loading
    }
    
    const inAuthGroup = segments[0] === '(auth)';

    if (isLoggedIn && inAuthGroup) {
      router.replace('/(protected)/home');
    } else if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)');
    }
  }, [isLoggedIn, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
       <RootLayoutNav />
    </AuthProvider>
  );
}
