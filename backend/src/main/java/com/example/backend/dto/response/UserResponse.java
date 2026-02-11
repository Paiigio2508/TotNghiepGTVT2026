package com.example.backend.dto.response;

import java.util.UUID;

public interface UserResponse {

    UUID getId();

    String getUserCode();

    String getName();

    String getClassName();

    String getEmail();

    String getPhone();

    String getUrlImage();
    String getCreatedAt();
    Integer getStatus();
}