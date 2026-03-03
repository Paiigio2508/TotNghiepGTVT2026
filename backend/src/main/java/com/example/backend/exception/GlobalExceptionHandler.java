package com.example.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handleAppException(AppException ex) {
        return ResponseEntity.ok(
                Map.of(
                        "success", false,
                        "message", ex.getMessage()
                )
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.ok(
                Map.of(
                        "success", false,
                        "message", "Dữ liệu đã tồn tại"
                )
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex,
                                             HttpServletRequest request) {

        // 🔥 Nếu là WebSocket thì không xử lý ở đây
        if (request.getRequestURI().startsWith("/ws")) {
            return null; // để Spring xử lý mặc định
        }

        return ResponseEntity.ok(
                Map.of(
                        "success", false,
                        "message", "Lỗi hệ thống"
                )
        );
    }
}