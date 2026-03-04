package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import com.example.backend.util.status.DeadlineType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table (name = "deadlines")
public class Deadline extends BaseEntity {

    private Integer weekNo;

    private String title;

    @Column(length = 500)
    private String description;

    private LocalDateTime dueDate;
    @Enumerated(EnumType.STRING)
    private DeadlineType type;
    @ManyToOne
    @JoinColumn(name = "internship_term_id")
    private InternshipTerm internshipTerm;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
}