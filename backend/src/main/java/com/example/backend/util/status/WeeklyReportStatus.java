package com.example.backend.util.status;

public enum WeeklyReportStatus {
    NOT_SUBMITTED,   // Chưa nộp
    SUBMITTED,       // Đã nộp đúng hạn
    LATE,            // Nộp trễ
    GRADED,          // Đã chấm
    REJECTED         // Bị yêu cầu nộp lại
}

