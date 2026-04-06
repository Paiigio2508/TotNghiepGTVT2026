package com.example.backend.repository;

import com.example.backend.dto.response.SpecializationResponse;
import com.example.backend.entity.Teacher;
import com.example.backend.entity.TeacherSpecialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TeacherSpecializationRepository extends JpaRepository<TeacherSpecialization, UUID> {
    @Query(value = """
                SELECT 
                    s.id AS id,
                    s.name AS name
                FROM teacher_specializations ts
                JOIN specialization s ON ts.specialization_id = s.id
                WHERE ts.teacher_id = :teacherId
                  AND (s.status = 0 OR s.status IS NULL)
            """, nativeQuery = true)
    List<SpecializationResponse> findSpecializationsRaw(@Param("teacherId") String teacherId);

    List<TeacherSpecialization> findByTeacher(Teacher teacher);

    void deleteByTeacher(Teacher teacher);
}