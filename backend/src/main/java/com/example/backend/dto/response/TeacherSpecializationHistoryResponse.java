package com.example.backend.dto.response;

public interface TeacherSpecializationHistoryResponse {
    String getId();
    String getTeacherId();
    String getTeacherCode();
    String getTeacherName();
    String getTermId();
    String getTermName();
    String getOldValue();
    String getNewValue();
    String getNote();
    String getCreatedAt();
}
