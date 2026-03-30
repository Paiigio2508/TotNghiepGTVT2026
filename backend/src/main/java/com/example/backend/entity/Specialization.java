package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "specialization")
public class Specialization extends BaseEntity {
    private String name;
    private String Description;
    private Integer status;
}
