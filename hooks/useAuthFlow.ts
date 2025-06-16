import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

const useAuthFlow = () => {
  const { refreshToken, updateToken, contextLogout } = useAuthContext();
  const [success, setSuccess] = useState<string | null>(null);

  const refreshTokenFunc = async () => {
    if (!refreshToken) {
      console.log("No refresh token, logging out.");
      contextLogout();
      return false;
    }
    try {
      const response = await fetch('http://localhost:8000/api/authentication/token/refresh/', {
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

  return { refreshTokenFunc };
};

export default useAuthFlow; 