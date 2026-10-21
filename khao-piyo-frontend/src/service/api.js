import axios from 'axios';
import { clearAuth, getStoredAuth, isTokenExpired } from '../utils/authStorage.js';

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api`;

// No token attached. Used for login/register, because a stale token
// could make your JWT filter reject those requests.
export const publicApi = axios.create({ baseURL: BASE_URL });

// Sends "Authorization: Bearer <token>" on every request.
export const api = axios.create({ baseURL: BASE_URL });

let unauthorizedHandler = null;
export const onUnauthorized = (fn) => {
  unauthorizedHandler = fn;
};

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.token) {
    if (isTokenExpired(auth.token)) {
      clearAuth();
      unauthorizedHandler?.();
      const err = new Error('Session expired');
      err.isAuthError = true;
      return Promise.reject(err);
    }
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// 401/403 while holding a token means the session is no longer valid -> sign out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if ((status === 401 || status === 403) && getStoredAuth()?.token) {
      err.isAuthError = true;
      clearAuth();
      unauthorizedHandler?.();
    }
    return Promise.reject(err);
  }
);