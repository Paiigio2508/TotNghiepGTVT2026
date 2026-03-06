package com.example.backend.repository;

import com.example.backend.dto.response.DeadlineProjection;
import com.example.backend.dto.response.TeacherWeeklyReportProjection;
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
    int countByTermAndTeacherAndWeek(@Param("termId") String termId, @Param("teacherId") String teacherId, @Param("weekNo") Integer weekNo);

    @Query(value = """
                SELECT * 
                FROM deadlines d
                WHERE d.internship_term_id = :termId
                AND d.teacher_id = :teacherId
                   ORDER BY d.created_at desc
            """, nativeQuery = true)
    List<Deadline> findByTermAndTeacher(@Param("termId") String termId, @Param("teacherId") String teacherId);

    @Query(value = """
            SELECT d.*,
                   d.week_no AS weekNo,
                   d.due_date AS dueDate,
                   COALESCE(wr.status, 'CHUA_NOP') AS status
            FROM deadlines d
            JOIN advisor_assignments aa
                ON aa.teacher_id = d.teacher_id
                AND aa.term_id = d.internship_term_id
            JOIN students s
                ON s.id = aa.student_id
            LEFT JOIN weekly_reports wr
                ON wr.deadline_id = d.id
                AND wr.advisor_assignment_id = aa.id
            WHERE s.user_id = :userId
            ORDER BY d.created_at desc
                                    """, nativeQuery = true)
    List<DeadlineProjection> findDeadlinesByStudentUserId(@Param("userId") String userId);

    @Query(value = """
                   SELECT d.id,
                    d.title,
                    d.week_no AS weekNo,
                    d.due_date AS dueDate,
                    d.description,
                    COALESCE(wr.status, 'CHUA_NOP') AS status,
                    wr.file_url as fileUrl,
                    wr.original_file_name as originalFileName,
                    sc.score as score,
                    sc.note as note
             FROM deadlines d
             JOIN advisor_assignments aa
                 ON aa.teacher_id = d.teacher_id
                 AND aa.term_id = d.internship_term_id
             JOIN students s
                 ON s.id = aa.student_id
             LEFT JOIN weekly_reports wr
                 ON wr.deadline_id = d.id
                 AND wr.advisor_assignment_id = aa.id
                 left join scores sc on sc.weekly_report_id = wr.id
                  WHERE d.id = :deadlineId
                    AND s.user_id = :userId
                  LIMIT 1
                            """, nativeQuery = true)
    Optional<DeadlineProjection> findDeadlineDetailForStudent(@Param("deadlineId") String deadlineId, @Param("userId") String userId);

    @Query(value = """
                 SELECT s.id AS studentId,s.student_code as studentCode, s.class_name as studentClass,
                                        s.full_name AS studentName,
                                             wr.id as weeklyReportId,
                                        COALESCE(wr.status, 'CHUA_NOP') AS status,
                                        wr.file_url AS fileUrl,
                                        wr.original_file_name as originalFileName,
                                        sc.score as score,
                                        sc.note as note
                                 FROM deadlines d
                                 JOIN teachers t ON t.id = d.teacher_id
                                 JOIN advisor_assignments aa
                                     ON aa.teacher_id = d.teacher_id
                                     AND aa.term_id = d.internship_term_id
                                 JOIN students s
                                     ON s.id = aa.student_id
                                 LEFT JOIN weekly_reports wr ON wr.deadline_id = d.id AND wr.advisor_assignment_id = aa.id
                                         left join scores sc on sc.weekly_report_id = wr.id
                      WHERE d.id = :deadlineId
                        AND t.user_id = :userId
                      ORDER BY s.full_name;
            """, nativeQuery = true)
    List<TeacherWeeklyReportProjection> findReportsByWeekAndDeadline(

            @Param("deadlineId") String deadlineId, @Param("userId") String userId);
}
