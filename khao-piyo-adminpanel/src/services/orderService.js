import { api } from './api';

// GET /api/orders/all  (admin only)
export const getAllOrders = async () => (await api.get('/orders/all')).data;

// PATCH /api/orders/status/{id}?status=Preparing  (admin only)
export const updateOrderStatus = async (orderId, status) => {
  await api.patch(`/orders/status/${orderId}`, null, { params: { status } });
};