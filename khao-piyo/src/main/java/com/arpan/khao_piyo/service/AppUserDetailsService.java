package com.arpan.khao_piyo.service;

import com.arpan.khao_piyo.entity.UserEntity;
import com.arpan.khao_piyo.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Users created before roles existed have no role -> treat as USER
        String role = user.getRole() == null ? "USER" : user.getRole();

        // Spring Security's hasRole("ADMIN") looks for "ROLE_ADMIN"
        String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;

        return new User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(authority))
        );
    }
}