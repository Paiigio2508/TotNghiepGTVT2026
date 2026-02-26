package com.example.backend.dto.request;

import lombok.Data;

@Data
public class UserRequest {
    private String userCode;
    private String fullName;
    private String gender;
    private String className;
    private String phone;
    private String email;
    private String urlImage;
}
