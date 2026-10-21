package com.arpan.khao_piyo.service;

import com.arpan.khao_piyo.io.UserRequest;
import com.arpan.khao_piyo.io.UserResponse;

public interface UserService {

    UserResponse registerUser(UserRequest request);

    String  findByUserId();
}
