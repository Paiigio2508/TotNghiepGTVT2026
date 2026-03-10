package com.example.backend.repository;

import com.example.backend.dto.response.ScoreForStudentView;
import com.example.backend.dto.response.ScoreStudentTeacherView;
import com.example.backend.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score, String> {
    Optional<Score> findByWeeklyReportId(String weeklyReportId);

    @Query(value = """
            SELECT
             d.week_no AS week,
             d.title AS title,
             COALESCE(s.score, 0) AS score,
             s.note AS note
            FROM advisor_assignments aa
            JOIN deadlines d
              ON d.internship_term_id = aa.term_id
            LEFT JOIN weekly_reports wr
              ON wr.deadline_id = d.id
              AND wr.advisor_assignment_id = aa.id
            LEFT JOIN scores s
              ON s.weekly_report_id = wr.id
            WHERE aa.student_id = :studentId
              AND d.teacher_id = aa.teacher_id
              AND d.type = 'REPORT'
            ORDER BY d.week_no;
                                                                   """, nativeQuery = true)
    List<ScoreForStudentView> getALLScoreByStudent(@Param("studentId") String studentId);

    @Query(value = """
SELECT
    s.id AS studentId,
    s.full_name AS studentName,
    tp.title AS topicTitle,
    d.week_no AS week,
    COALESCE(sc.score,0) AS score
FROM advisor_assignments aa
JOIN students s ON aa.student_id = s.id
LEFT JOIN topics tp ON aa.topic_id = tp.id

JOIN deadlines d
  ON d.internship_term_id = aa.term_id
 AND d.teacher_id = aa.teacher_id

LEFT JOIN weekly_reports wr
  ON wr.advisor_assignment_id = aa.id
 AND wr.deadline_id = d.id

LEFT JOIN scores sc
  ON sc.weekly_report_id = wr.id

WHERE aa.term_id = :termID
AND d.type = "REPORT"
AND (:teacherID IS NULL OR aa.teacher_id = :teacherID)

ORDER BY s.full_name, d.week_no;
                   """, nativeQuery = true)
    List<ScoreStudentTeacherView> getALLScoreStudentByTeacher(
            @Param("teacherID") String teacherID,
            @Param("termID") String termID
    );

}
