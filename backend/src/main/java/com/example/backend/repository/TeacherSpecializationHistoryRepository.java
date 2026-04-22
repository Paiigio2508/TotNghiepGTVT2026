package com.example.backend.repository;

import com.example.backend.dto.response.TeacherSpecializationHistoryResponse;
import com.example.backend.entity.TeacherSpecializationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface TeacherSpecializationHistoryRepository extends JpaRepository<TeacherSpecializationHistory, String> {
    @Query(value = """
            SELECT
                h.id AS id,
                t.id AS teacherId,
                t.teacher_code AS teacherCode,
                t.full_name AS teacherName,
                it.id AS termId,
                it.name AS termName,
                h.old_value AS oldValue,
                h.new_value AS newValue,
                h.note AS note,
                DATE_FORMAT(h.created_at, '%d/%m/%Y %H:%i:%s') AS createdAt
            FROM teacher_specialization_history h
            JOIN teachers t ON h.teacher_id = t.id
            LEFT JOIN internship_terms it ON h.term_id = it.id
            WHERE h.term_id = :termId
            ORDER BY h.created_at DESC
            """, nativeQuery = true)
    List<TeacherSpecializationHistoryResponse> findHistoryByTermId(String termId);
}