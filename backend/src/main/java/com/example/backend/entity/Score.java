package com.example.backend.entity;


import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "scores")
public class Score extends BaseEntity {

    private Double score;

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToOne
    @JoinColumn(name = "advisor_assignment_id", unique = true)
    private AdvisorAssignment advisorAssignment;
}
