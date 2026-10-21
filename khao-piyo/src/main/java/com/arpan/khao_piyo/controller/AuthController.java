package com.arpan.khao_piyo.controller;

import com.arpan.khao_piyo.entity.UserEntity;
import com.arpan.khao_piyo.io.AuthenticationRequest;
import com.arpan.khao_piyo.io.AuthenticationResponse;
import com.arpan.khao_piyo.repository.UserRepository;
import com.arpan.khao_piyo.service.AppUserDetailsService;
import com.arpan.khao_piyo.utils.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public AuthenticationResponse login(@RequestBody AuthenticationRequest request){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword()
        ));
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String jwtToken = jwtUtil.generateToken(userDetails);

        UserEntity user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String role = user.getRole() == null ? "USER" : user.getRole();

        return new AuthenticationResponse(request.getEmail(), jwtToken, role);
    }
}
