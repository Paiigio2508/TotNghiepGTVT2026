package com.example.backend.util.status;


public enum FinalReportStatus {
    SUBMITTED,          // Sinh viên đã nộp
    NEED_REVISION,      // Giảng viên yêu cầu sửa
    TEACHER_APPROVED,   // Giảng viên đã duyệt, gửi admin
    ADMIN_APPROVED,     // Admin duyệt cuối
    GRADED              // Đã chấm điểm
}