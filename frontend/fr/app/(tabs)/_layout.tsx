import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  // const { isLoggedIn } = useAuth();
  // console.log('isLoggedIn in tabs/_layout:', isLoggedIn);
  const isLoggedIn = false;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Login',
        }}
      />
      {isLoggedIn ? (
        <Tabs.Screen
          name="MyPage"
          options={{
            title: 'MyPage----',
          }}
        />
      ) : null}
    </Tabs>
  );
}
