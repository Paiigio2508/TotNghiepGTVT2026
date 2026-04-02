package com.example.backend.repository;

import com.example.backend.entity.TeacherSpecializationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface TeacherSpecializationHistoryRepository extends JpaRepository<TeacherSpecializationHistory, UUID> {
    @Query(value = """
              SELECT
                          h.old_value AS oldValue,
                          h.new_value AS newValue,
                          h.note AS note,
                          h.created_at AS createdDate
                      FROM teacher_specialization_history h
                      JOIN teachers t ON h.teacher_id = t.id
                WHERE t.user_id = :userId
                     ORDER BY h.created_at DESC
            """, nativeQuery = true)
    List<Map<String, Object>> getHistory(String userId);
}