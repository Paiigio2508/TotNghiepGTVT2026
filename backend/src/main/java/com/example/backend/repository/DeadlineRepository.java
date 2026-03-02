package com.example.backend.repository;

import com.example.backend.entity.Deadline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeadlineRepository extends JpaRepository<Deadline, String> {
    @Query(value = """
                SELECT COUNT(*) 
                FROM deadlines d
                WHERE d.internship_term_id = :termId
                AND d.teacher_id = :teacherId
                AND d.week_no = :weekNo
            """, nativeQuery = true)
    int countByTermAndTeacherAndWeek(
            @Param("termId") String termId,
            @Param("teacherId") String teacherId,
            @Param("weekNo") Integer weekNo
    );

    @Query(value = """
                SELECT * 
                FROM deadlines d
                WHERE d.internship_term_id = :termId
                AND d.teacher_id = :teacherId
                ORDER BY d.week_no ASC
            """, nativeQuery = true)
    List<Deadline> findByTermAndTeacher(
            @Param("termId") String termId,
            @Param("teacherId") String teacherId
    );

    @Query(value = """
                 SELECT d.*
                 FROM deadlines d
                 JOIN advisor_assignments aa
                 ON aa.teacher_id = d.teacher_id
                 AND aa.term_id = d.internship_term_id
                 JOIN students s
                 ON s.id = aa.student_id
                WHERE s.user_id = :userId
                ORDER BY d.week_no DESC 
            """, nativeQuery = true)
    List<Deadline> findDeadlinesByStudentUserId(@Param("userId") String userId);

    @Query(value = """
                SELECT d.*
                FROM deadlines d
                JOIN advisor_assignments aa
                    ON aa.teacher_id = d.teacher_id
                    AND aa.term_id = d.internship_term_id
                JOIN students s
                    ON s.id = aa.student_id
                WHERE d.id = :deadlineId
                  AND s.user_id = :userId
            """, nativeQuery = true)
    Optional<Deadline> findDeadlineDetailForStudent(
            @Param("deadlineId") String deadlineId,
            @Param("userId") String userId
    );
}