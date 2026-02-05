package com.example.backend.entity;
import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_reports")
public class WeeklyReport extends BaseEntity {

    private Integer weekNo;
    private String filePath;
    private LocalDateTime submitDate;
    private String status; // SUBMITTED, LATE

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;
}
