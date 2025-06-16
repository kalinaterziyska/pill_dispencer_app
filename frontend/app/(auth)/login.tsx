import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import FormField from '@/components/ui/FormField';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';

export default function LoginPage() {
  const { loading, error, handleLogin } = useAuthFlow();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    handleLogin(email, password);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/kitty-removebg-preview1.png')} style={styles.logo} />
        <ThemedText type="title" style={styles.title}>Welcome Back!</ThemedText>
        <ThemedText style={styles.subtitle}>Log in to continue</ThemedText>
      </View>
      
      <View style={styles.formContainer}>
        <FormField
          label="Email"
          icon="envelope"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <FormField
          label="Password"
          icon="lock"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity 
        onPress={onLogin}
        disabled={loading}
        style={styles.button}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <ThemedText>Don't have an account? </ThemedText>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <ThemedText style={styles.linkText}>Register</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.dark.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  formContainer: {
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.dark.tint,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
    height: 60,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    color: Colors.dark.tint,
    fontWeight: '600',
  },
});
