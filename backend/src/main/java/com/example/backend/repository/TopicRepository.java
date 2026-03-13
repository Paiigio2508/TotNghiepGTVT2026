package com.example.backend.repository;

import com.example.backend.dto.response.TopicAdminView;
import com.example.backend.dto.response.TopicTeacherView;
import com.example.backend.entity.Student;
import com.example.backend.entity.Topic;
import com.example.backend.util.status.TopicStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, String> {

    List<Topic> findByStudent(Student student);

    boolean existsByStudentAndStatus(Student student, TopicStatus status);

    @Query(value = """
            SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                s.full_name AS fullName,
                s.student_code AS studentCode
            FROM topics t
            JOIN students s
                ON s.id = t.student_id
            JOIN advisor_assignments a
                ON a.student_id = t.student_id
                AND a.term_id = t.term_id
            JOIN teachers te
                ON te.id = a.teacher_id
            JOIN users u
                ON u.id = te.user_id
                   WHERE u.id = :userId
                      AND a.term_id = :termId order by studentCode
            """, nativeQuery = true)
    List<TopicTeacherView> findTopicsByTeacherAndTerm(@PathVariable("userId") String userId, @PathVariable("termId") String termId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
                UPDATE Topic t
                SET t.status = :status
                WHERE t.student.id = :studentId
                  AND t.term.id = :termId
                  AND t.id <> :approvedTopicId
            """)
    void rejectOtherTopics(
            @Param("studentId") String studentId,
            @Param("termId") String termId,
            @Param("approvedTopicId") String approvedTopicId,
            @Param("status") TopicStatus status
    );

    @Query(value = """
                SELECT 
                    t.id,
                    t.title,
                    t.description,
                    t.status,
                    s.full_name AS fullName,
                    s.student_code AS studentCode,
                    s.class_name AS className,
                    te.full_name AS teacherName,
                    te.teacher_code AS teacherCode,
                    it.academic_year AS academicYear
                FROM topics t
                JOIN students s 
                    ON s.id = t.student_id
                JOIN internship_terms it 
                    ON it.id = t.term_id
                JOIN advisor_assignments a
                    ON a.student_id = t.student_id
                    AND a.term_id = t.term_id
                JOIN teachers te 
                    ON te.id = a.teacher_id
                WHERE t.status = 'APPROVED_BY_TEACHER'
                  AND t.term_id = :termId
            """, nativeQuery = true)
    
    List<TopicAdminView> findForAdmin(@Param("termId") String termId);
}