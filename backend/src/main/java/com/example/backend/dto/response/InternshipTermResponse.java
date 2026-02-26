package com.example.backend.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface InternshipTermResponse {
    String getId();

    String getName();

    String getAcademicYear();          // academic_year as year

    String getDescription();

    LocalDate getStartDate();  // start_date as startDate

    LocalDate getEndDate();    // end_date as endDate

    String getStatus();
    LocalDateTime getCreatedAt();
    String getStudentCode();
    String getFullName();
    String getClassName();
    String getTeacherName();
}
