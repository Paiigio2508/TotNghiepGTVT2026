package com.example.backend.repository;

import com.example.backend.dto.response.TeacherWeeklyReportProjection;
import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.Deadline;
import com.example.backend.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, String> {
    boolean existsByAdvisorAssignmentAndDeadline(
            AdvisorAssignment advisorAssignment,
            Deadline deadline
    );
    Optional<WeeklyReport> findByAdvisorAssignmentAndDeadline(
            AdvisorAssignment advisorAssignment,
            Deadline deadline
    );
    @Query("""
    SELECT wr
    FROM WeeklyReport wr
    JOIN wr.deadline d
    JOIN d.teacher t
    WHERE d.id = :deadlineId
      AND t.user.id = :userId
      AND wr.fileUrl IS NOT NULL
""")
    List<WeeklyReport> findAllByDeadlineAndTeacher(
            @Param("deadlineId") String deadlineId,
            @Param("userId") String userId
    );
}
