package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "internship_terms")
public class InternshipTerm extends BaseEntity {

    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String academicYear;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String status;
}