import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'expo-image';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthFlow } from '@/hooks/useAuthFlow';

const InfoCard = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.infoCard}>
    <FontAwesome name={icon} size={24} color="#888" />
    <View>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  </View>
);

export default function MyPage() {
  const colorScheme = useColorScheme();
  const { userData, error, handleLogout } = useAuthFlow();

  if (error) {
    return (
      <View style={styles.center}>
        <ThemedText type="error">{error}</ThemedText>
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
        <ThemedView style={styles.mainContainer}>
          <View style={styles.headerContent}>
            <ThemedText type="title" style={styles.userName}>{userData?.username || 'User'}</ThemedText>
            <ThemedText style={styles.userEmail}>{userData?.email || 'No email'}</ThemedText>
          </View>
          
          <View style={styles.contentContainer}>
            {!userData ? (
              <ActivityIndicator size="large" color={Colors.dark.tint} />
            ) : (
              <View>
                <InfoCard icon="user" label="Username" value={userData.username} />
                <InfoCard icon="envelope" label="Email" value={userData.email} />
                <InfoCard icon="phone" label="Phone Number" value={userData.phoneNumber} />
              </View>
            )}
          </View>
        </ThemedView>
      </ParallaxScrollView>

      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity 
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]} 
        >
          <FontAwesome name="sign-out" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  userEmail: {
    fontSize: 16,
    color: 'white',
  },
  mainContainer: {
    backgroundColor: '#121212', // Match page background color
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 15,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  kittyImage: {
    width: '100%',
    height: 300,
  },
  logoutButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
    backgroundColor: '#121212',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    gap: 12,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
