import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../service/authService.js';
import { onUnauthorized } from '../service/api.js';
import {
  clearAuth,
  getSavedName,
  getStoredAuth,
  isTokenExpired,
  saveAuth,
  saveName,
} from '../utils/authStorage.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Restore a saved session, unless its token has expired
const initialAuth = () => {
  const stored = getStoredAuth();
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
    onUnauthorized(logout);
    return () => onUnauthorized(null);
  }, [logout]);

  // Keep several browser tabs in sync (sign in or out in one -> the others follow)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'kp-auth') setAuth(initialAuth());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest({ email, password });
    const next = { email: data.email, token: data.token, name: getSavedName(data.email) };
    saveAuth(next); // written first so the very next API call already has the token
    setAuth(next);
    return next;
  };

  const register = async (name, email, password) => {
    await registerRequest({ name, email, password });
    saveName(email, name);
    return login(email, password); // sign the new user straight in
  };

  const user = useMemo(
    () =>
      auth
        ? {
            email: auth.email,
            name: auth.name,
            displayName: auth.name || auth.email.split('@')[0],
          }
        : null,
    [auth]
  );

  const value = {
    user,
    token: auth?.token || null,
    isAuthenticated: Boolean(auth),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};