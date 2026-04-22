package com.example.backend.repository;

import com.example.backend.entity.TeacherSpecializationTerm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherSpecializationTermRepository extends JpaRepository<TeacherSpecializationTerm, String> {


    List<TeacherSpecializationTerm> findByTerm_Id(String termId);

    List<TeacherSpecializationTerm> findByTeacher_IdAndTerm_Id(String teacherId, String termId);

    void deleteByTeacher_IdAndTerm_Id(String teacherId, String termId);


}
