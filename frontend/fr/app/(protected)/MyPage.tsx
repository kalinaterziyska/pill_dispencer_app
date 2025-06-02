import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function MyPage() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/'); // rerout to  login
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Wellcome to the protected page!</Text>
      <Button title="Exit" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  text: {
    fontSize: 20, marginBottom: 20,
  },
});
