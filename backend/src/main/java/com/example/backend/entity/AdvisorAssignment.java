package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import com.example.backend.util.status.InternshipResult;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(
        name = "advisor_assignments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_id", "term_id"})
        }
)
public class AdvisorAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;

    @Column(nullable = false)
    private LocalDate assignedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InternshipResult result = InternshipResult.DANG_THUC_TAP;
}