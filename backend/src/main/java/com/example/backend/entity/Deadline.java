package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table (name = "deadlines")
public class Deadline extends BaseEntity {

    private Integer weekNo;
    private LocalDateTime dueDate;

    @OneToOne
    @JoinColumn(name = "advisor_assignment_id")
    private AdvisorAssignment advisorAssignment;
}