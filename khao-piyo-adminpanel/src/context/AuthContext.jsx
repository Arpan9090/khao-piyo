import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { publicApi, setUnauthorizedHandler } from '../services/api';
import { clearAuth, getAuth, isTokenExpired, saveAuth } from '../utils/authStorage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const initialAuth = () => {
  const stored = getAuth();
  if (stored?.token && !isTokenExpired(stored.token)) return stored;
  clearAuth();
  return null;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(initialAuth);

  const logout = useCallback(() => {
    clearAuth();
    setAuth(null);
  }, []);

  // Lets the axios layer sign the user out when the server rejects the token
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await publicApi.post('/login', { email, password });
    const next = { email: data.email, name: data.name, role: data.role || 'USER', token: data.token };
    saveAuth(next);
    setAuth(next);
    return next;
  };

  const value = useMemo(
    () => ({
      user: auth ? { email: auth.email, name: auth.name || auth.email.split('@')[0] } : null,
      isAuthenticated: Boolean(auth),
      isAdmin: auth?.role === 'ADMIN', // UI only. The server enforces the real permission.
      login,
      logout,
    }),
    [auth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};