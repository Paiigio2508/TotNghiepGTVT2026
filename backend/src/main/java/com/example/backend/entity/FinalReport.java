package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import com.example.backend.util.status.FinalReportStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "final_reports",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "advisor_assignment_id")
        }
)
public class FinalReport extends BaseEntity {

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    @Column(name = "submit_date", nullable = false)
    private LocalDateTime submitDate;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    // Nhận xét của giảng viên
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FinalReportStatus status = FinalReportStatus.SUBMITTED;

    // Điểm cuối cùng
    private Double score;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advisor_assignment_id", nullable = false, unique = true)
    private AdvisorAssignment advisorAssignment;

    @PrePersist
    public void prePersist() {
        if (this.submitDate == null) {
            this.submitDate = LocalDateTime.now();
        }

        if (this.status == null) {
            this.status = FinalReportStatus.SUBMITTED;
        }
    }
}