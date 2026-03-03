package com.example.backend.entity;
import com.example.backend.entity.base.BaseEntity;
import com.example.backend.util.status.WeeklyReportStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "weekly_reports",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"advisor_assignment_id", "deadline_id"})
        }
)
public class WeeklyReport extends BaseEntity {

    private Integer weekNo;

    @Column(length = 1000, nullable = false)
    private String fileUrl;
    @Column(nullable = false)
    private String originalFileName;
    private LocalDateTime submitDate;
    private Double score;
    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeeklyReportStatus status; // SUBMITTED, LATE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advisor_assignment_id", nullable = false)
    private AdvisorAssignment advisorAssignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deadline_id", nullable = false)
    private Deadline deadline;
}
