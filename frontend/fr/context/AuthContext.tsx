// app/AuthContext.tsx

import React from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  login: async () => ({ success: false, message: 'Not implemented' }),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);

  // Check for existing token on mount
  React.useEffect(() => {
    const checkToken = async () => {
      try {
        let storedToken;
        if (Platform.OS === 'web') {
          storedToken = localStorage.getItem('access_token');
        } else {
          storedToken = await SecureStore.getItemAsync('access_token');
        }
        if (storedToken) {
          setToken(storedToken);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking stored token:', error);
      }
    };
    checkToken();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const res = await fetch('http://localhost:8000/authentication/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data: TokenResponse = await res.json();
        // Store token in state
        setToken(data.access);
        setIsLoggedIn(true);

        // Store token in persistent storage
        try {
          if (Platform.OS === 'web') {
            localStorage.setItem('access_token', data.access);
          } else {
            await SecureStore.setItemAsync('access_token', data.access);
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
    }
  };

  const logout = async () => {
    setToken(null);
    setIsLoggedIn(false);
    
    // Clear token from storage
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('access_token');
      } else {
        await SecureStore.deleteItemAsync('access_token');
      }
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
