package com.example.backend.entity;


import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "scores")
public class Score extends BaseEntity {

    private Float score;

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;
}
