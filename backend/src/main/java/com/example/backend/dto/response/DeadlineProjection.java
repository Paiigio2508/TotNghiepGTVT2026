package com.example.backend.dto.response;

import java.time.LocalDateTime;

public interface DeadlineProjection {


        String getId();

        String getTitle();
        String getType();
        String getFileUrl();
        String getOriginalFileName();
        Integer getWeekNo();

        LocalDateTime getDueDate();
        String getDescription();

        String getStatus();

}
