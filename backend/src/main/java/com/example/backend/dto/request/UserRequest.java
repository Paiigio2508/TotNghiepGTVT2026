package com.example.backend.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserRequest {
    private String userCode;
    private String fullName;
    private String gender;
    private LocalDate ngaySinh;
    private String className;
    private String phone;
    private String email;
    private String specializationId;
    private String urlImage;
}
