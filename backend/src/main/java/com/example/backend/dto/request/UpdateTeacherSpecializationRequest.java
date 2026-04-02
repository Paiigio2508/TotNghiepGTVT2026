package com.example.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateTeacherSpecializationRequest {
    private String userId;
    private List<String> specializationIds;
    private String note;
}
