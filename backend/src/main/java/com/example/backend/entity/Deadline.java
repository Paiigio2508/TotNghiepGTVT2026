package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table (name = "deadlines")
public class Deadline extends BaseEntity {

    private Integer weekNo;

    private String title;

    @Column(length = 500)
    private String description;

    private LocalDateTime dueDate;

    @ManyToOne
    @JoinColumn(name = "internship_term_id")
    private InternshipTerm internshipTerm;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
}