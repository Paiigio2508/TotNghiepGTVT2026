package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ImportStudentResponse {
    private int successCount;
    private int failCount;
    private String message;
    private List<String> errors;
}