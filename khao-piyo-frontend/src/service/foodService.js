import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/foods`,
});

// GET /api/foods
export const getFoods = async () => {
  const { data } = await API.get('');
  return data;
};

// GET /api/foods/{id}
export const getFoodById = async (id) => {
  const { data } = await API.get(`/${id}`);
  return data;
};
