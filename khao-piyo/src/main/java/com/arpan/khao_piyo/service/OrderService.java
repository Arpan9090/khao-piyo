package com.arpan.khao_piyo.service;

import com.arpan.khao_piyo.io.OrderRequest;
import com.arpan.khao_piyo.io.OrderResponse;
import com.razorpay.RazorpayException;

import java.util.List;
import java.util.Map;

public interface OrderService {

    OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException;

    void verifyPayment(Map<String , String > paymentData, String status);

    List<OrderResponse> getUserOrders();  //for user, what they have place the orders

    void removeOrder(String orderId);

    List<OrderResponse> getOrdersOfAllUsers();  // for admin, he can see how many order are there, live

    void updateOrderStatus(String orderId, String status);
}
