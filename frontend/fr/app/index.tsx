// app/index.tsx
import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Text } from 'react-native';

export default function Index() {
  const { isLoggedIn } = useAuth();

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {isLoggedIn ? (
//         // Protected + tabs
//         <Stack.Screen name="(protected)" />
//       ) : (
//         // Public auth flow
//         <Stack.Screen name="auth" />
//       )}
//     </Stack>
//   );

    if (isLoggedIn) {
        return <Redirect href="/(protected)/home" />;
    }
    return <Redirect href="/(auth)/register" />;
}