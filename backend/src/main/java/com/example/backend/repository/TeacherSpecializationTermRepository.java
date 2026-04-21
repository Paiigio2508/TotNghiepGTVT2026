package com.example.backend.repository;

import com.example.backend.entity.TeacherSpecializationTerm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherSpecializationTermRepository  extends JpaRepository<TeacherSpecializationTerm, String> {

    List<TeacherSpecializationTerm> findByTermId(String termId);

    List<TeacherSpecializationTerm> findByTeacherIdAndTermId(String teacherId, String termId);

    void deleteByTeacherIdAndTermId(String teacherId, String termId);
}
