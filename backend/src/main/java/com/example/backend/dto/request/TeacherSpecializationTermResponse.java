package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TeacherSpecializationTermResponse {
    private String teacherId;
    private String teacherCode;
    private String fullName;
    private String email;
    private String role;
    private List<SpecializationItem> specializations;

    @Data
    @AllArgsConstructor
    public static class SpecializationItem {
        private String id;
        private String name;
    }
}