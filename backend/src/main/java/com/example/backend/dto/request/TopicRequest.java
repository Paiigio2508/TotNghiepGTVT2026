package com.example.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TopicRequest {

    private String title;

    private String description;

    private String termId;
}