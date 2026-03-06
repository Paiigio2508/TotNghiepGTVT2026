package com.example.backend.repository;

import com.example.backend.dto.response.ScoreForStudentView;
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
             FROM deadlines d
             JOIN advisor_assignments aa
             ON aa.term_id = d.internship_term_id
             LEFT JOIN weekly_reports wr
             ON wr.deadline_id = d.id
             AND wr.advisor_assignment_id = aa.id
             LEFT JOIN scores s
             ON s.weekly_report_id = wr.id
             WHERE d.type ='REPORT' and aa.student_id =:studentId
             ORDER BY d.week_no;
                     """, nativeQuery = true)
    List<ScoreForStudentView> getALLScoreByStudent(@Param("studentId") String studentId);

}
