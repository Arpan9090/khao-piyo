import { api } from './api.js';

// Every call returns the updated cart: { id, userId, items: { [foodId]: quantity } }

export const getServerCart = async () => (await api.get('/cart')).data;

// Adds ONE of this food
export const addItem = async (foodId) => (await api.post('/cart', { foodId })).data;

// Removes ONE of this food
export const removeItem = async (foodId) => (await api.post('/cart/remove', { foodId })).data;

export const clearServerCart = async () => {
  await api.delete('/cart');
};