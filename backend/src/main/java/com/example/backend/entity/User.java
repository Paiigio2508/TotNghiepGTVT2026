package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class User extends BaseEntity {

    @Column(unique = true)
    private String username;
    private String password;
    private String role;   // ADMIN, STUDENT, TEACHER
    private String email;
    private String phone;
    @Column(name = "url_image", length = 1000)
    private String urlImage;
    private Integer status;
}