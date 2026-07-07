import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin } from '../lib/api/auth';
import { getToken, setToken, getStoredUser, setStoredUser } from '../lib/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setTokenState] = useState(() => getToken());

  const login = useCallback(async (email, password) => {
    const result = await apiLogin(email, password);
    if (!result.user || result.user.role !== 'admin') {
      throw new Error('Only admin accounts may access this console.');
    }
    setToken(result.accessToken);
    setStoredUser(result.user);
    setTokenState(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setStoredUser(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user && user.role === 'admin'),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
