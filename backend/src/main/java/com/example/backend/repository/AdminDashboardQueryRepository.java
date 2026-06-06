package com.example.backend.repository;

import com.example.backend.entity.Deadline;
import com.example.backend.entity.FinalReport;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class AdminDashboardQueryRepository {

    private final EntityManager entityManager;

    public Long countStudentsByTerm(String termId) {
        return count("""
                SELECT COUNT(aa.id)
                FROM AdvisorAssignment aa
                WHERE aa.term.id = :termId
                """, Map.of("termId", termId));
    }

    public Long countTeachersByTerm(String termId) {
        return count("""
                SELECT COUNT(DISTINCT aa.teacher.id)
                FROM AdvisorAssignment aa
                WHERE aa.term.id = :termId
                """, Map.of("termId", termId));
    }

    public Long countTopicsByTerm(String termId) {
        return count("""
                SELECT COUNT(t.id)
                FROM Topic t
                WHERE t.term.id = :termId
                """, Map.of("termId", termId));
    }

    public Long countFinalSubmittedByTerm(String termId) {
        return count("""
                SELECT COUNT(fr.id)
                FROM FinalReport fr
                WHERE fr.advisorAssignment.term.id = :termId
                """, Map.of("termId", termId));
    }

    public Long countFinalGradedByTerm(String termId) {
        return count("""
                SELECT COUNT(fr.id)
                FROM FinalReport fr
                WHERE fr.advisorAssignment.term.id = :termId
                  AND fr.score IS NOT NULL
                """, Map.of("termId", termId));
    }

    public Double avgFinalScoreByTerm(String termId) {
        return avg("""
                SELECT AVG(fr.score)
                FROM FinalReport fr
                WHERE fr.advisorAssignment.term.id = :termId
                  AND fr.score IS NOT NULL
                """, Map.of("termId", termId));
    }

    public List<TopicStatusCount> countTopicStatusByTerm(String termId) {
        List<Object[]> rows = entityManager.createQuery("""
                SELECT t.status, COUNT(t.id)
                FROM Topic t
                WHERE t.term.id = :termId
                GROUP BY t.status
                """, Object[].class)
                .setParameter("termId", termId)
                .getResultList();

        return rows.stream()
                .map(row -> new TopicStatusCount(
                        row[0] == null ? "" : row[0].toString(),
                        (Long) row[1]
                ))
                .toList();
    }

    public List<Deadline> findDeadlinesByTerm(String termId) {
        return entityManager.createQuery("""
                SELECT d
                FROM Deadline d
                LEFT JOIN FETCH d.teacher
                WHERE d.internshipTerm.id = :termId
                ORDER BY d.weekNo ASC, d.dueDate ASC
                """, Deadline.class)
                .setParameter("termId", termId)
                .getResultList();
    }

    public Long countStudentsByTermAndTeacher(String termId, String teacherId) {
        return count("""
                SELECT COUNT(aa.id)
                FROM AdvisorAssignment aa
                WHERE aa.term.id = :termId
                  AND aa.teacher.id = :teacherId
                """, Map.of(
                "termId", termId,
                "teacherId", teacherId
        ));
    }

    public Long countWeeklySubmittedByDeadline(String deadlineId) {
        return count("""
                SELECT COUNT(wr.id)
                FROM WeeklyReport wr
                WHERE wr.deadline.id = :deadlineId
                """, Map.of("deadlineId", deadlineId));
    }

    public Long countWeeklyLateByDeadline(String deadlineId) {
        List<Object[]> rows = entityManager.createQuery("""
                SELECT wr.status, COUNT(wr.id)
                FROM WeeklyReport wr
                WHERE wr.deadline.id = :deadlineId
                GROUP BY wr.status
                """, Object[].class)
                .setParameter("deadlineId", deadlineId)
                .getResultList();

        long total = 0L;

        for (Object[] row : rows) {
            String status = row[0] == null ? "" : row[0].toString().toUpperCase();

            if (status.contains("LATE")) {
                total += (Long) row[1];
            }
        }

        return total;
    }

    public List<TeacherBaseStat> findTeacherBaseStatsByTerm(String termId) {
        List<Object[]> rows = entityManager.createQuery("""
                SELECT aa.teacher.id,
                       aa.teacher.teacherCode,
                       aa.teacher.fullName,
                       COUNT(aa.id)
                FROM AdvisorAssignment aa
                WHERE aa.term.id = :termId
                GROUP BY aa.teacher.id, aa.teacher.teacherCode, aa.teacher.fullName
                ORDER BY aa.teacher.fullName ASC
                """, Object[].class)
                .setParameter("termId", termId)
                .getResultList();

        return rows.stream()
                .map(row -> new TeacherBaseStat(
                        (String) row[0],
                        (String) row[1],
                        (String) row[2],
                        (Long) row[3]
                ))
                .toList();
    }

    public List<TopicStatusCount> countTopicStatusByTermAndTeacher(String termId, String teacherId) {
        List<Object[]> rows = entityManager.createQuery("""
                SELECT aa.topic.status, COUNT(aa.id)
                FROM AdvisorAssignment aa
                WHERE aa.term.id = :termId
                  AND aa.teacher.id = :teacherId
                  AND aa.topic IS NOT NULL
                GROUP BY aa.topic.status
                """, Object[].class)
                .setParameter("termId", termId)
                .setParameter("teacherId", teacherId)
                .getResultList();

        return rows.stream()
                .map(row -> new TopicStatusCount(
                        row[0] == null ? "" : row[0].toString(),
                        (Long) row[1]
                ))
                .toList();
    }

    public Long countFinalSubmittedByTermAndTeacher(String termId, String teacherId) {
        return count("""
                SELECT COUNT(fr.id)
                FROM FinalReport fr
                WHERE fr.advisorAssignment.term.id = :termId
                  AND fr.advisorAssignment.teacher.id = :teacherId
                """, Map.of(
                "termId", termId,
                "teacherId", teacherId
        ));
    }

    public Long countFinalGradedByTermAndTeacher(String termId, String teacherId) {
        return count("""
                SELECT COUNT(fr.id)
                FROM FinalReport fr
                WHERE fr.advisorAssignment.term.id = :termId
                  AND fr.advisorAssignment.teacher.id = :teacherId
                  AND fr.score IS NOT NULL
                """, Map.of(
                "termId", termId,
                "teacherId", teacherId
        ));
    }

    public Double avgFinalScoreByTermAndTeacher(String termId, String teacherId) {
        return avg("""
                SELECT AVG(fr.score)
                FROM FinalReport fr
                WHERE fr.advisorAssignment.term.id = :termId
                  AND fr.advisorAssignment.teacher.id = :teacherId
                  AND fr.score IS NOT NULL
                """, Map.of(
                "termId", termId,
                "teacherId", teacherId
        ));
    }

    public List<FinalReport> findRecentFinalReportsByTerm(String termId, int limit) {
        return entityManager.createQuery("""
                SELECT fr
                FROM FinalReport fr
                JOIN FETCH fr.advisorAssignment aa
                JOIN FETCH aa.student s
                JOIN FETCH aa.teacher t
                LEFT JOIN FETCH aa.topic topic
                WHERE aa.term.id = :termId
                ORDER BY fr.submitDate DESC
                """, FinalReport.class)
                .setParameter("termId", termId)
                .setMaxResults(limit)
                .getResultList();
    }

    private Long count(String jpql, Map<String, Object> params) {
        var query = entityManager.createQuery(jpql, Long.class);
        params.forEach(query::setParameter);
        return query.getSingleResult();
    }

    private Double avg(String jpql, Map<String, Object> params) {
        var query = entityManager.createQuery(jpql, Double.class);
        params.forEach(query::setParameter);
        return query.getSingleResult();
    }

    public record TopicStatusCount(String status, Long total) {
    }

    public record TeacherBaseStat(
            String teacherId,
            String teacherCode,
            String teacherName,
            Long students
    ) {
    }
}