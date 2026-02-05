package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table (name = "deadlines")
public class Deadline extends BaseEntity {

    private Integer weekNo;
    private LocalDateTime dueDate;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;
}