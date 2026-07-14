import { useState, useMemo, useEffect } from 'react';

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleTokenChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('auth-token-changed', handleTokenChange);
    return () => window.removeEventListener('auth-token-changed', handleTokenChange);
  }, []);

  const user = useMemo(() => {
    if (!token) return null;
    try {
      let base64 = token.split('.')[1];
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) {
        base64 += '='.repeat(4 - pad);
      }
      const payload = JSON.parse(atob(base64));
      return { id: payload.userId };
    } catch (e) {
      return null;
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    window.location.href = '/'; // Force navigation and reset all component states to pick up the new token
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    window.location.href = '/login'; // Force navigation and reset all component states
  };

  return { isAuthenticated: !!token, user, login, logout };
};
