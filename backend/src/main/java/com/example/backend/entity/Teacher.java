package com.example.backend.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "teachers")
public class Teacher {
    @Id
    private UUID id;
    private String teacherCode;
    private String fullName;
    private String department;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}