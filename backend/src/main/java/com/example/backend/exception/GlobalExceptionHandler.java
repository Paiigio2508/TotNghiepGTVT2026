package com.example.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 🔥 BẮT LỖI CUSTOM
    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handleAppException(AppException ex) {
        return ResponseEntity.ok(
                Map.of(
                        "success", false,
                        "message", ex.getMessage()
                )
        );
    }

    // 🔥 PHÒNG TRƯỜNG HỢP DB UNIQUE (race condition)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.ok(
                Map.of(
                        "success", false,
                        "message", "Dữ liệu đã tồn tại"
                )
        );
    }

    // 🔥 LỖI KHÁC
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        return ResponseEntity.ok(
                Map.of(
                        "success", false,
                        "message", "Lỗi hệ thống"
                )
        );
    }
}