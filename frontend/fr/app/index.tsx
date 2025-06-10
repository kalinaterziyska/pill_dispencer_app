// app/index.tsx
import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Text } from 'react-native';

export default function Index() {
  const { isLoggedIn } = useAuth();
  
    if (isLoggedIn) {
        return <Redirect href="/(protected)/home" />;
    }
    return <Redirect href="/(auth)/register" />;
}