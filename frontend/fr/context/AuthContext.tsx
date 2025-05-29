// app/AuthContext.tsx

import React from 'react';

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
        // store JWT for subsequent requests
        setToken(data.access);
        setIsLoggedIn(true);
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

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
