package com.example.backend.entity;
import com.example.backend.entity.base.BaseEntity;
import com.example.backend.util.status.WeeklyReportStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_reports")
public class WeeklyReport extends BaseEntity {

    private Integer weekNo;
    @Column( length = 1000)
    private String filePath;
    private LocalDateTime submitDate;


    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne
    private AdvisorAssignment advisorAssignment;
    @ManyToOne
    @JoinColumn(name = "deadline_id")
    private Deadline deadline;
    @Enumerated(EnumType.STRING)
    private WeeklyReportStatus status; // SUBMITTED, LATE
}
