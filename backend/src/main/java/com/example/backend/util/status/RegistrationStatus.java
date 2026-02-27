package com.example.backend.util.status;

public enum RegistrationStatus {
    PENDING,               // chờ GV duyệt
    APPROVED_BY_TEACHER,   // GV duyệt
    REJECTED_BY_TEACHER,
    FINAL_APPROVED,        // Admin duyệt cuối
    REJECTED_BY_ADMIN,
    CANCELLED
}
