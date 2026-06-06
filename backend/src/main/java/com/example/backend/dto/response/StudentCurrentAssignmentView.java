package com.example.backend.dto.response;

import java.time.LocalDate;

public interface StudentCurrentAssignmentView {

    String getId();

    String getStudentId();

    String getStudentName();

    String getStudentCode();

    String getTeacherId();

    String getTeacherName();

    String getTeacherCode();

    String getTermId();

    String getTermName();

    String getAcademicYear();

    LocalDate getStartDate();

    LocalDate getEndDate();

    String getTopicId();

    String getTopicTitle();
}