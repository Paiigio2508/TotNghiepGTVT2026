package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "students")
public class Student {
    @Id
    private UUID id;
    private String studentCode;
    private String fullName;
    private String className;
    private String major;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
