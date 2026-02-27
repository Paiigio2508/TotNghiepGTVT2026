package com.example.backend.entity;
import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_reports")
public class WeeklyReport extends BaseEntity {

    private Integer weekNo;
    @Column( length = 1000)
    private String filePath;
    private LocalDateTime submitDate;
    private String status; // SUBMITTED, LATE

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne
    private AdvisorAssignment advisorAssignment;
}
