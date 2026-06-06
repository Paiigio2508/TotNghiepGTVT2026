package com.example.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FinalReportRequest {

    // Dùng khi sinh viên nộp / nộp lại
    private String advisorAssignmentId;
    private String fileUrl;
    private String originalFileName;

    // Dùng khi giảng viên nhận xét yêu cầu sửa
    private String comment;

    // Dùng khi chấm điểm
    private Double score;
}