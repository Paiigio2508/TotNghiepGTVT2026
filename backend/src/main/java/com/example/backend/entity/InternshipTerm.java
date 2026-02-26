package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import com.example.backend.util.status.TermStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "internship_terms")
public class InternshipTerm extends BaseEntity {

    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String academicYear;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    private TermStatus status;
}