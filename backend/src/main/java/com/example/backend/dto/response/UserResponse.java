package com.example.backend.dto.response;

import java.util.UUID;

public interface UserResponse {

    UUID getId();

    String getUserCode();

    String getName();
    String getGender();

    String getClassName();

    String getEmail();

    String getPhone();

    String getUrlImage();
    String getCreatedAt();
    String getStatus();
}