package com.example.backend.dto.response;

import java.time.LocalDateTime;

public interface DeadlineProjection {


        String getId();

        String getTitle();


        Integer getWeekNo();

        LocalDateTime getDueDate();
        String getDescription();

        String getStatus();

}
