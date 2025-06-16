import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '@/constants/api';

interface UserData {
  email: string;
  username: string;
  phoneNumber: string;
}

export function useAuthFlow() {
  const { login: contextLogin, logout: contextLogout, token, refreshToken, updateToken } = useAuth();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshTokenFunc = async () => {
    if (!refreshToken) {
      console.log("No refresh token, logging out.");
      contextLogout();
      return false;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/authentication/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!response.ok) {
        console.log("Refresh token is invalid or expired, logging out.");
        contextLogout();
        return false;
      }
      const { access } = await response.json();
      await updateToken(access);
      console.log("Token refreshed successfully.");
      return true;
    } catch (e) {
      console.error("Error refreshing token:", e);
      contextLogout();
      return false;
    }
  };

  // Fetch user data if a token exists
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/authentication/user/`, {
          headers: new Headers({
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          })
        });
        if (response.status === 401) {
          const refreshed = await refreshTokenFunc();
          if (refreshed) {
            // This is a simplified retry logic. In a real-world app,
            // you'd likely use the *new* token from your context.
            // Re-fetching user data will be implicitly handled by the [token] dependency array
            // if the context properly updates and triggers a re-render.
            console.log("Retrying fetchUserData after token refresh.");
            return; // Exit to wait for re-render
          } else {
            throw new Error('Session expired. Please log in again.');
          }
        }
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      }
    };
    fetchUserData();
  }, [token]);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const result = await contextLogin(email, password);
    if (!result.success) {
      setError(result.message ?? 'Error logging in');
    }
    setLoading(false);
  };

  const handleRegister = async (formData: any) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (formData.password !== formData.password2) {
      setError('Passwords dont match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/authentication/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Registration Successful! Redirecting to login...');
        setTimeout(() => {
          router.replace('./login');
        }, 2000);
      } else {
        const errorData = await response.json();
        const errorMessage = Object.values(errorData).flat().join(' ');
        setError(errorMessage || 'Error registering. Please try again.');
      }
    } catch (e) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!refreshToken) {
      // If there's no refresh token, just log out on the client
      contextLogout();
      return;
    }
    
    try {
      await fetch(`${API_BASE_URL}/authentication/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      // Always log out on the client, even if the backend call fails
      contextLogout();
    }
  };

  return {
    userData,
    error,
    loading,
    success,
    handleLogin,
    handleRegister,
    handleLogout,
    setError,
    setSuccess,
    refreshToken: refreshTokenFunc,
  };
} 