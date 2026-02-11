package com.example.backend.entity;
import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;
@Entity
@Table(name = "final_reports")
public class FinalReport extends BaseEntity {
    @Column(length = 1000)
    private String filePath;
    private LocalDateTime submitDate;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;
}
