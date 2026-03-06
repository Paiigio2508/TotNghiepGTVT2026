package com.example.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class ScoreRequest {
    private Double score;
    private String note;
    private String weeklyReportId;
}
