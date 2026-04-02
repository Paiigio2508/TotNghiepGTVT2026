package com.example.backend.repository;

import com.example.backend.entity.Teacher;
import com.example.backend.entity.TeacherSpecialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeacherSpecializationRepository extends JpaRepository<TeacherSpecialization, UUID> {
    List<TeacherSpecialization> findByTeacher(Teacher teacher);
    void deleteByTeacher(Teacher teacher);
}