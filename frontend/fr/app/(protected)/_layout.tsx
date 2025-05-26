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
      <Tabs.Screen name="MyPage" options={{ title: 'MyPage' }} />
      <Tabs.Screen name="Page2" options={{ title: 'Page 2' }} />
      <Tabs.Screen name="Page3" options={{ title: 'Page 3' }} />
    </Tabs>
  );
}
