package com.example.backend.controller;

import com.example.backend.dto.request.LoginRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());

        if(optionalUser.isEmpty()) {
            System.out.println("Username không tồn tại: " + request.getUsername());
        }

        User user = optionalUser.orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        String token = jwtTokenProvider.generateToken(
                user.getUsername(),
                user.getRole()
        );

        return ResponseEntity.ok(token);
    }
}
