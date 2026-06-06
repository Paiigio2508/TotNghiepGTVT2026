package com.example.backend.repository;

import com.example.backend.dto.response.FinalReportView;
import com.example.backend.entity.FinalReport;
import com.example.backend.util.status.FinalReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FinalReportRepository extends JpaRepository<FinalReport, String> {

    // =========================
    // Dùng cho xử lý nghiệp vụ
    // =========================

    Optional<FinalReport> findByAdvisorAssignment_Id(String advisorAssignmentId);

    boolean existsByAdvisorAssignment_Id(String advisorAssignmentId);

    List<FinalReport> findByAdvisorAssignment_Term_Id(String termId);

    List<FinalReport> findByAdvisorAssignment_Teacher_Id(String teacherId);

    List<FinalReport> findByAdvisorAssignment_Teacher_IdAndAdvisorAssignment_Term_Id(
            String teacherId,
            String termId
    );

    List<FinalReport> findByStatus(FinalReportStatus status);

    List<FinalReport> findByStatusAndAdvisorAssignment_Term_Id(
            FinalReportStatus status,
            String termId
    );


    // =========================
    // Dùng cho FE hiển thị
    // =========================

    @Query("""
        SELECT 
            fr.id AS id,
            fr.fileUrl AS fileUrl,
            fr.originalFileName AS originalFileName,
            fr.submitDate AS submitDate,
            fr.comment AS comment,
            fr.status AS status,
            fr.score AS score,

            aa.id AS advisorAssignmentId,

            s.id AS studentId,
            s.studentCode AS studentCode,
            s.fullName AS studentName,

            t.id AS teacherId,
            t.fullName AS teacherName,

            term.id AS termId,
            term.name AS termName,

            topic.id AS topicId,
            topic.title AS topicTitle

        FROM FinalReport fr
        JOIN fr.advisorAssignment aa
        JOIN aa.student s
        JOIN aa.teacher t
        JOIN aa.term term
        LEFT JOIN aa.topic topic
        WHERE aa.term.id = :termId
        ORDER BY fr.submitDate DESC
    """)
    List<FinalReportView> findAllViewByTermId(@Param("termId") String termId);


    @Query("""
    SELECT 
        fr.id AS id,
        fr.fileUrl AS fileUrl,
        fr.originalFileName AS originalFileName,
        fr.submitDate AS submitDate,
        fr.comment AS comment,
        fr.status AS status,
        fr.score AS score,

        aa.id AS advisorAssignmentId,

        s.id AS studentId,
        s.studentCode AS studentCode,
        s.fullName AS studentName,

        t.id AS teacherId,
        t.fullName AS teacherName,

        term.id AS termId,
        term.name AS termName,

        topic.id AS topicId,
        topic.title AS topicTitle

    FROM FinalReport fr
    JOIN fr.advisorAssignment aa
    JOIN aa.student s
    JOIN aa.teacher t
    JOIN aa.term term
    LEFT JOIN aa.topic topic
    WHERE t.user.id = :userId
      AND term.id = :termId
    ORDER BY fr.submitDate DESC
""")
    List<FinalReportView> findAllViewByTeacherUserIdAndTermId(
            @Param("userId") String userId,
            @Param("termId") String termId
    );


    @Query("""
        SELECT 
            fr.id AS id,
            fr.fileUrl AS fileUrl,
            fr.originalFileName AS originalFileName,
            fr.submitDate AS submitDate,
            fr.comment AS comment,
            fr.status AS status,
            fr.score AS score,

            aa.id AS advisorAssignmentId,

            s.id AS studentId,
            s.studentCode AS studentCode,
            s.fullName AS studentName,

            t.id AS teacherId,
            t.fullName AS teacherName,

            term.id AS termId,
            term.name AS termName,

            topic.id AS topicId,
            topic.title AS topicTitle

        FROM FinalReport fr
        JOIN fr.advisorAssignment aa
        JOIN aa.student s
        JOIN aa.teacher t
        JOIN aa.term term
        LEFT JOIN aa.topic topic
        WHERE fr.status = :status
          AND aa.term.id = :termId
        ORDER BY fr.submitDate DESC
    """)
    List<FinalReportView> findAllViewByStatusAndTermId(
            @Param("status") FinalReportStatus status,
            @Param("termId") String termId
    );


    @Query("""
        SELECT 
            fr.id AS id,
            fr.fileUrl AS fileUrl,
            fr.originalFileName AS originalFileName,
            fr.submitDate AS submitDate,
            fr.comment AS comment,
            fr.status AS status,
            fr.score AS score,

            aa.id AS advisorAssignmentId,

            s.id AS studentId,
            s.studentCode AS studentCode,
            s.fullName AS studentName,

            t.id AS teacherId,
            t.fullName AS teacherName,

            term.id AS termId,
            term.name AS termName,

            topic.id AS topicId,
            topic.title AS topicTitle

        FROM FinalReport fr
        JOIN fr.advisorAssignment aa
        JOIN aa.student s
        JOIN aa.teacher t
        JOIN aa.term term
        LEFT JOIN aa.topic topic
        WHERE aa.id = :advisorAssignmentId
    """)
    Optional<FinalReportView> findViewByAdvisorAssignmentId(
            @Param("advisorAssignmentId") String advisorAssignmentId
    );


    @Query(value = """
        SELECT fr.*
        FROM final_reports fr
        WHERE fr.advisor_assignment_id IN (:danhSachIdPhanCong)
    """, nativeQuery = true)
    List<FinalReport> findAllByDanhSachPhanCong(
            @Param("danhSachIdPhanCong") List<String> danhSachIdPhanCong
    );
}