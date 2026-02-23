package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;
    @Column(unique = true)
    private String studentCode;
    private String fullName;
    private String className;
    private String major;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
