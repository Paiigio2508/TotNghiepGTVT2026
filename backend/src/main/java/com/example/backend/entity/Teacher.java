package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "teachers")
public class Teacher extends BaseEntity {

    private String teacherCode;
    private String fullName;
    private String department;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}