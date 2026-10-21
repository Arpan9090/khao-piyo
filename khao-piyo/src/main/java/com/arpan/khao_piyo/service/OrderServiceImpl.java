package com.arpan.khao_piyo.service;

import com.arpan.khao_piyo.entity.OrderEntity;
import com.arpan.khao_piyo.io.OrderRequest;
import com.arpan.khao_piyo.io.OrderResponse;
import com.arpan.khao_piyo.repository.CartRepository;
import com.arpan.khao_piyo.repository.OrderRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.AllArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService{

    private static final List<String> ALLOWED_STATUSES =
            List.of("Order Placed", "Preparing", "Out for Delivery", "Delivered", "Cancelled");


    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private CartRepository cartRepository;

    @Value("${razorpay_key}")
    private String RAZORPAY_KEY;

    @Value("${razorpay_secret}")
    private String RAZORPAY_SECRET;

    @Override
    public OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException {
        OrderEntity newOrder = convertToEntity(request);

        newOrder = orderRepository.save(newOrder);

        newOrder.setPaymentStatus("pending");
        newOrder.setOrderStatus("Pending payment");
        newOrder.setUserId(userService.findByUserId());

        //create razorpay payment order
        RazorpayClient razorpayClient = new RazorpayClient(RAZORPAY_KEY, RAZORPAY_SECRET);

        JSONObject orderRequest = new JSONObject();

        // Convert double amount to int/long (multiplied by 100 if it's in Rupees)
        long amountInPaise = (long) (newOrder.getAmount() * 100);

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("payment_capture",1 );

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        newOrder.setRazorpayOrderId(razorpayOrder.get("id"));

        String loggedInUserId = userService.findByUserId();
        newOrder.setUserId(loggedInUserId);
        newOrder = orderRepository.save(newOrder);
        return convertToResponse(newOrder);

    }

    @Override
    public void verifyPayment(Map<String, String> paymentData, String status) {
        String razorpayOrderId = paymentData.get("razorpay_order_id");

        OrderEntity existingOrder = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        existingOrder.setPaymentStatus(status);
        existingOrder.setRazorpaySignature(paymentData.get("razorpay_signature"));
        existingOrder.setRazorpayPaymentId(paymentData.get("razorpay_payment_id"));

        orderRepository.save(existingOrder);

        if("paid".equalsIgnoreCase(status)){
            // Set order status so Admin and Customer see "Order Placed"
            existingOrder.setOrderStatus("Order Placed");
            cartRepository.deleteByUserId(existingOrder.getUserId());
        }
        orderRepository.save(existingOrder);
    }

    @Override
    public List<OrderResponse> getUserOrders() {
        String loggedInUser = userService.findByUserId();
        List<OrderEntity> list = orderRepository.findByUserId(loggedInUser);
        return list.stream()
                .filter(order -> "paid".equalsIgnoreCase(order.getPaymentStatus()))
                .map(entity -> convertToResponse(entity))
                .collect(Collectors.toList());

    }

    @Override
    public void removeOrder(String orderId) {
        orderRepository.deleteById(orderId);
    }

    @Override
    public List<OrderResponse> getOrdersOfAllUsers() {
        List<OrderEntity> list = orderRepository.findAll();
        return list.stream().map(order -> convertToResponse(order))
                .collect(Collectors.toList());
    }

    @Override
    public void updateOrderStatus(String orderId, String status) {
        String newStatus = ALLOWED_STATUSES.stream()
                .filter(s -> s.equalsIgnoreCase(status))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status"));

        OrderEntity entity = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found!"));

        if (!"paid".equalsIgnoreCase(entity.getPaymentStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only paid orders can be updated");
        }
        if ("Delivered".equalsIgnoreCase(entity.getOrderStatus())
                || "Cancelled".equalsIgnoreCase(entity.getOrderStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is already closed");
        }

        entity.setOrderStatus(newStatus);
        orderRepository.save(entity);
    }

    private OrderResponse convertToResponse(OrderEntity newOrder) {
        return OrderResponse.builder()
                .id(newOrder.getId())
                .userId(newOrder.getUserId())
                .userAddress(newOrder.getUserAddress())
                .phoneNumber(newOrder.getPhoneNumber())
                .email(newOrder.getEmail())
                .amount(newOrder.getAmount())
                .paymentStatus(newOrder.getPaymentStatus())
                .razorPayOrderId(newOrder.getRazorpayOrderId())
                .orderStatus(newOrder.getOrderStatus())
                .orderedItems(newOrder.getOrderedItems())
                .build();
    }

    private OrderEntity convertToEntity(OrderRequest request) {
        return OrderEntity.builder()
                .orderedItems(request.getOrderedItems())
                .userAddress(request.getUserAddress())
                .amount(request.getAmount())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .orderStatus(request.getOrderStatus())
                .build();

    }
}
