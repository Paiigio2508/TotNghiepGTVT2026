package com.example.backend.util.status;

public enum NotificationType {
    DEADLINE_CREATED,            // giảng viên tạo deadline mới
    TOPIC_REGISTERED_SUCCESS,    // sinh viên đăng ký đề tài thành công
    TOPIC_APPROVED_BY_TEACHER,   // giảng viên duyệt đề tài
    TOPIC_APPROVED_BY_ADMIN,     // admin duyệt đề tài

    WEEKLY_REPORT_DUE_SOON,      // báo cáo tuần sắp hết hạn
    WEEKLY_REPORT_GRADED,        // giảng viên chấm báo cáo tuần

    FINAL_REPORT_GRADED          // giảng viên chấm báo cáo cuối
}
