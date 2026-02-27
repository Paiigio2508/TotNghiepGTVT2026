package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import com.example.backend.util.status.TopicStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "topics")
public class Topic extends BaseEntity {

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "term_id")
    private InternshipTerm term;

    @Enumerated(EnumType.STRING)
    private TopicStatus status;
}
