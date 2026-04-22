package com.example.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeTeacherRequest {
    private String teacherId;
    private String reason;
}