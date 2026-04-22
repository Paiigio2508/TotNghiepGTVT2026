package com.example.backend.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SaveTeacherSpecializationTermRequest {
    private String teacherId;
    private String termId;
    private List<String> specializationIds;
}