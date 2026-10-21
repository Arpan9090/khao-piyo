package com.arpan.khao_piyo.controller;

import com.arpan.khao_piyo.io.UserRequest;
import com.arpan.khao_piyo.io.UserResponse;
import com.arpan.khao_piyo.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody UserRequest request){
        UserResponse registeredUser = userService.registerUser(request);
        return  ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
    }
}
