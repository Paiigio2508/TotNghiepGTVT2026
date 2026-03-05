package com.example.backend.dto.response;

public interface TeacherWeeklyReportProjection {
    String getStudentId();
    String getWeeklyReportId();
    String getStudentName();
    String getStudentCode();
    String getStudentClass();
    String getStatus();
    String getFileUrl();
    String getOriginalFileName();
}
