package com.example.backend.dto.response;

import java.util.UUID;

public interface UserResponse {

    UUID getId();
    String getUserID();

    String getUserCode();

    String getName();
    String getGender();
    String getRole();
    String getClassName();

    String getEmail();

    String getPhone();
    String getNgaySinh();

    String getUrlImage();
    String getCreatedAt();
    String getStatus();
}