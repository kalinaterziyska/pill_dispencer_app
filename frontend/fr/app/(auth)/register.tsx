import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    if (!email || !username || !phoneNumber || !password || !password2) {
      setError('Please fill all the fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please write a valid email');
      return;
    }

    if (password !== password2) {
      setError('Passwords dont match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/authentication/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, phoneNumber, password, password2 }),
      });

      if (response.status === 200) {
        setSuccess('Registration Successful!');
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } else if (response.status === 400) {
        setError('Error registrating. Please try again');
      } else {
        setError('Unexpected error: ${response.status}');
      }
    } catch (e) {
      setError('Error conecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginBottom: 12, borderWidth: 1, padding: 8, borderRadius: 4 }}
      />
      <TextInput
        placeholder="User"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{ marginBottom: 12, borderWidth: 1, padding: 8, borderRadius: 4 }}
      />
      <TextInput
        placeholder="Phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={{ marginBottom: 12, borderWidth: 1, padding: 8, borderRadius: 4 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 12, borderWidth: 1, padding: 8, borderRadius: 4 }}
      />
      <TextInput
        placeholder="Repeat password"
        value={password2}
        onChangeText={setPassword2}
        secureTextEntry
        style={{ marginBottom: 12, borderWidth: 1, padding: 8, borderRadius: 4 }}
      />

      {error && <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>}
      {success && <Text style={{ color: 'green', marginBottom: 12 }}>{success}</Text>}

      <Button
        title={loading ? 'Registering...' : 'Register'}
        onPress={handleRegister}
        disabled={loading}
      />

        <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={{ marginTop: 20, color: 'blue', textAlign: 'center' }}>
            Or LOGIN
            </Text>
        </TouchableOpacity>
    </View>
  );
}
