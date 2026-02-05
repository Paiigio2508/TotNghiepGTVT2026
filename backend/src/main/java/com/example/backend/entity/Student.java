package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student extends BaseEntity {

    private String studentCode;
    private String fullName;
    private String className;
    private String major;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
