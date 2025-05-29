import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { Slot } from 'expo-router';

// function RootLayoutNav() {
//   const { isLoggedIn } = useAuth();

//   if (isLoggedIn) {
//     // Показваме защитената навигация (тези от (protected) с табове)
//     return <Stack screenOptions={{ headerShown: false }} >
//       <Stack.Screen name="(protected)" />
//       <Stack.Screen name="(auth)/index" options={{ presentation: 'modal' }} />
//     </Stack>;
//   } else {
//     // Показваме публичната навигация (login)
//     return <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="(auth)" />
//       <Stack.Screen name="(protected)/MyPage" options={{ presentation: 'modal' }} />
//     </Stack>;
//   }
// }

export default function RootLayout() {
  return (
    <AuthProvider>
       <Slot />
      {/* <RootLayoutNav /> */}
    </AuthProvider>
  );
}
