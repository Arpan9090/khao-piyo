package com.arpan.khao_piyo.service;

import com.arpan.khao_piyo.io.CartRequest;
import com.arpan.khao_piyo.io.CartResponse;

public interface CartService {

    CartResponse addToCart(CartRequest request);

    CartResponse getCart();

    void clearCart();


    //decrese the quantity of the food item
    CartResponse removeFromCart(CartRequest cartRequest);
}
