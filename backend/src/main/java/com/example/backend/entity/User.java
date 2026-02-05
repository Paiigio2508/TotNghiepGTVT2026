package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(unique = true)
    private String username;
    private String password;
    private String role;   // ADMIN, STUDENT, TEACHER
    private String email;
    private Integer status;
}