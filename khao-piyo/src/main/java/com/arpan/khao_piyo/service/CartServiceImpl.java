package com.arpan.khao_piyo.service;

import com.arpan.khao_piyo.entity.CartEntity;
import com.arpan.khao_piyo.io.CartRequest;
import com.arpan.khao_piyo.io.CartResponse;
import com.arpan.khao_piyo.repository.CartRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CartServiceImpl implements CartService{
    private final CartRepository cartRepository;
    private final UserService userService;

    @Override
    public CartResponse addToCart(CartRequest request) {
        String loggedInUserId = userService.findByUserId();
        Optional<CartEntity> cartOptional = cartRepository.findByUserId(loggedInUserId);
        CartEntity cart = cartOptional
                .orElseGet(() -> new CartEntity(loggedInUserId, new HashMap<>()));
        Map<String , Integer> cartItems = cart.getItems();
        cartItems.put(request.getFoodId(), cartItems.getOrDefault(request.getFoodId(), 0) + 1);
        cart.setItems(cartItems);
        cart = cartRepository.save(cart);
        return convertToResponse(cart);
    }

    @Override
    public CartResponse getCart() {
        String loggedInUserId = userService.findByUserId();
        CartEntity cartEntity = cartRepository.findByUserId(loggedInUserId)
                .orElse(new CartEntity(null, loggedInUserId, new HashMap<>()));
        return convertToResponse(cartEntity);
    }

    @Override
    public void clearCart() {
        String loggedInUserId = userService.findByUserId();
        cartRepository.deleteByUserId(loggedInUserId);
    }

    @Override
    public CartResponse removeFromCart(CartRequest cartRequest) {
        String loggedInUserId = userService.findByUserId();
        CartEntity cartEntity = cartRepository.findByUserId(loggedInUserId)
                .orElseThrow(() -> new RuntimeException("Cart not found!"));
        Map<String , Integer> cartItems = cartEntity.getItems();

        if (cartItems.containsKey(cartRequest.getFoodId())) {
            int currentQuantity = cartItems.get(cartRequest.getFoodId());
            if (currentQuantity > 1) {
                cartItems.put(cartRequest.getFoodId(), currentQuantity - 1);
            } else {
                cartItems.remove(cartRequest.getFoodId());
            }
            cartEntity = cartRepository.save(cartEntity);
        }
        return convertToResponse(cartEntity);

    }

    private CartResponse convertToResponse(CartEntity cartEntity){
        return CartResponse.builder()
                .id(cartEntity.getId())
                .userId(cartEntity.getUserId())
                .items(cartEntity.getItems())
                .build();
    }
}
