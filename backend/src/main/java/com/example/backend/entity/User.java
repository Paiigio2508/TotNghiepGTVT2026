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

    private String username;
    private String password;
    private String role;   // ADMIN, STUDENT, TEACHER
    @Column(unique = true)
    private String email;
    @Column(unique = true)
    private String phone;
    @Column(name = "url_image", length = 1000)
    private String urlImage;
    private Integer status;
}