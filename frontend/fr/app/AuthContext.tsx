// app/AuthContext.tsx

import React from 'react';

type LoginResult = {
  success: boolean;
  message?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType>({
  isLoggedIn: false,
  login: async () => ({ success: false, message: 'NP implemented login'}),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    // if (username === 'user' && password === 'parola') {
    //   setIsLoggedIn(true);
    //   return { success: true };
    // }

    try {
      const res = await fetch('http://localhost:8000/authentication/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 200) {
        setIsLoggedIn(true);
        return { success: true };
      }
    } catch (err) {
      console.warn('Грешка при връзка със сървъра:', err);
    }
    return { success: false, message: 'Грешно потребителско име или парола.' };
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

