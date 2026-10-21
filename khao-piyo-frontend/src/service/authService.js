import { publicApi } from './api.js';

// POST /api/register  { name, email, password }  ->  { id, name, email }
export const registerRequest = async (payload) => (await publicApi.post('/register', payload)).data;

// POST /api/login  { email, password }  ->  { email, token }
export const loginRequest = async (payload) => (await publicApi.post('/login', payload)).data;