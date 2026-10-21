import { api } from './api.js';

// POST /api/orders/create -> OrderResponse
// (note: your DTO's JSON key for the Razorpay order is "razorPayOrderId", with a capital P)
export const createOrder = async (payload) => (await api.post('/orders/create', payload)).data;

// POST /api/orders/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = async (paymentData) => {
  await api.post('/orders/verify', paymentData);
};

// GET /api/orders -> the signed-in user's orders
export const getMyOrders = async () => (await api.get('/orders')).data;