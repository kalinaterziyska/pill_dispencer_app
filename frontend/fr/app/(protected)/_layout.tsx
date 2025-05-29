import { Colors } from '@/constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';


export default function ProtectedLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="MyPage" options={{ title: 'Profile' }} />
    </Tabs>
  );
}