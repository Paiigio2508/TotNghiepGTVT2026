package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "teachers")
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;
    @Column(unique = true)
    private String teacherCode;
    private String fullName;
    private String department;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}