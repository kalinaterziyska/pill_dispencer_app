import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import FormField from '@/components/ui/FormField';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';

export default function RegisterPage() {
  const { loading, error, success, handleRegister } = useAuthFlow();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phoneNumber: '',
    password: '',
    password2: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const onRegister = () => {
    handleRegister(formData);
  };

  return (
    <ThemedView style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/kitty-removebg-preview1.png')} style={styles.logo} />
          <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>Join us today!</ThemedText>
        </View>
        
        <View style={styles.formContainer}>
          <FormField
            label="Email"
            icon="envelope"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            label="Username"
            icon="user"
            placeholder="Choose a username"
            value={formData.username}
            onChangeText={(v) => handleChange('username', v)}
            autoCapitalize="none"
          />
          <FormField
            label="Phone Number"
            icon="phone"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChangeText={(v) => handleChange('phoneNumber', v)}
            keyboardType="phone-pad"
          />
          <FormField
            label="Password"
            icon="lock"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(v) => handleChange('password', v)}
            secureTextEntry
          />
          <FormField
            label="Repeat Password"
            icon="lock"
            placeholder="Confirm your password"
            value={formData.password2}
            onChangeText={(v) => handleChange('password2', v)}
            secureTextEntry
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {success && <Text style={styles.successText}>{success}</Text>}

        <TouchableOpacity 
          onPress={onRegister}
          disabled={loading}
          style={styles.button}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText>Already have an account? </ThemedText>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <ThemedText style={styles.linkText}>Login</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.dark.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
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
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.dark.tint,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
