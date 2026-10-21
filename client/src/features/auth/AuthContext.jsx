import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/auth/me');
      setUser(res.user);
    } catch (err) {
      // 401 is an expected state for guest users
      if (err instanceof ApiError && err.statusCode === 401) {
        setUser(null);
      } else {
        console.error('Failed to restore authentication session:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async ({ email, password }) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async ({ displayName, email, password }) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { displayName, email, password });
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout endpoint error (proceeding with local state clear):', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
