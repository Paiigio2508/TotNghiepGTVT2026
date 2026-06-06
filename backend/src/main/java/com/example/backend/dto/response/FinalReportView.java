package com.example.backend.dto.response;

import com.example.backend.util.status.FinalReportStatus;

import java.time.LocalDateTime;

public interface FinalReportView {

    String getId();

    String getFileUrl();

    String getOriginalFileName();

    LocalDateTime getSubmitDate();

    String getComment();

    FinalReportStatus getStatus();

    Double getScore();

    String getAdvisorAssignmentId();

    String getStudentId();

    String getStudentCode();

    String getStudentName();

    String getTeacherId();

    String getTeacherName();

    String getTermId();

    String getTermName();

    String getTopicId();

    String getTopicTitle();
}