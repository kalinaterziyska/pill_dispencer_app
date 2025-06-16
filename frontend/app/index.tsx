// app/index.tsx
import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const auth = useAuth();

  if (auth?.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  if (auth?.isLoggedIn) {
      return <Redirect href="/home" />;
  }
  
  return <Redirect href="/login" />;
}