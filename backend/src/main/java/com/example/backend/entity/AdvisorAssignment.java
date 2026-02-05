package com.example.backend.entity;
import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;
@Entity
@Table(name = "advisor_assignments")
public class AdvisorAssignment extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;
}