package com.example.backend.dto.response;

public interface TeacherWeeklyReportProjection {
    String getStudentId();
    String getStudentName();
    String getStudentCode();
    String getStudentClass();
    String getStatus();
    String getFileUrl();
    String getOriginalFileName();
}
