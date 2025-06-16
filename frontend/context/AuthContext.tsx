// app/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/constants/api';

interface LoginResult {
  success: boolean;
  message?: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
  user: {
    email: string;
    username: string;
    phoneNumber: string;
  };
}

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  updateToken: (newToken: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check for existing token on mount
  React.useEffect(() => {
    const checkToken = async () => {
      try {
        let storedToken, storedRefreshToken;
        if (Platform.OS === 'web') {
          storedToken = localStorage.getItem('access_token');
          storedRefreshToken = localStorage.getItem('refresh_token');
        } else {
          storedToken = await SecureStore.getItemAsync('access_token');
          storedRefreshToken = await SecureStore.getItemAsync('refresh_token');
        }
        if (storedToken && storedRefreshToken) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking stored token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  const updateToken = async (newToken: string) => {
    setToken(newToken);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('access_token', newToken);
      } else {
        await SecureStore.setItemAsync('access_token', newToken);
      }
    } catch (storageError) {
      console.error('Error storing new access token:', storageError);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/authentication/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data: TokenResponse = await res.json();
        // Store tokens in state
        setToken(data.access);
        setRefreshToken(data.refresh);
        setIsLoggedIn(true);

        // Store tokens in persistent storage
        try {
          if (Platform.OS === 'web') {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
          } else {
            await SecureStore.setItemAsync('access_token', data.access);
            await SecureStore.setItemAsync('refresh_token', data.refresh);
          }
        } catch (storageError) {
          console.error('Error storing token:', storageError);
        }

        return { success: true };
      }

      // non-200
      const errText = await res.text();
      return { success: false, message: errText || res.statusText };
    } catch (err: any) {
      console.warn('Error connecting to server:', err);
      return { success: false, message: 'Connection error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);
    
    // Clear tokens from storage
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } else {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, refreshToken, isLoading, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
