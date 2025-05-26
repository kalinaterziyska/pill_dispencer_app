import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isLoggedIn) {
      router.replace('/MyPage');
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message ?? 'Error loging in');
    } else {
      setError(null);
      router.replace('/MyPage');
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Log in</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ marginBottom: 12, borderWidth: 1, padding: 8, borderRadius: 4 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 12, borderWidth: 1, padding: 8, borderRadius: 4 }}
      />
      {error && <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>}
      <Button title="LOGIN" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={{ marginTop: 20, color: 'blue', textAlign: 'center' }}>
          or register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
