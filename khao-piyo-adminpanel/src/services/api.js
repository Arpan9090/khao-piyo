import axios from 'axios';
import { clearAuth, getAuth, isTokenExpired } from '../utils/authStorage';

const BASE_URL = 'http://localhost:8080/api';

// For unauthenticated endpoints (login)
export const publicApi = axios.create({
  baseURL: BASE_URL,
});

// For authenticated endpoints (orders, foods)
export const api = axios.create({
  baseURL: BASE_URL,
});

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Automatically attach admin JWT token
api.interceptors.request.use((config) => {
  const auth = getAuth();
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

// Auto sign out ONLY on 401 (expired or invalid token)
// 403 means forbidden permission, which the page UI handles without kicking you to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && getAuth()?.token) {
      err.isAuthError = true;
      clearAuth();
      unauthorizedHandler?.();
    }
    return Promise.reject(err);
  }
);

export const getFoods = () => api.get('/foods');
export const addFood = (formData) =>
  api.post('/foods', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteFood = (id) => api.delete(`/foods/delete/${id}`);

export default api;