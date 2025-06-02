import { Colors } from '@/constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';

export default function ProtectedLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopWidth: 1,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
          height: 55,
          paddingBottom: 0,
          paddingTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="MyPage"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="chevron.left.forwardslash.chevron.right" color={color} />,
        }}
      />
    </Tabs>
  );
}