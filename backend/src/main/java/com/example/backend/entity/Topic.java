package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "topics")
public class Topic extends BaseEntity {

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer maxStudents;
    private String status; // OPEN, CLOSED

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "term_id")
    private InternshipTerm term;
}
