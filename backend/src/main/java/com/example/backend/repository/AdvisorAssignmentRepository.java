package com.example.backend.repository;

import com.example.backend.dto.response.InternshipTermResponse;
import com.example.backend.dto.response.StudentProjection;
import com.example.backend.entity.AdvisorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface AdvisorAssignmentRepository extends JpaRepository<AdvisorAssignment, String> {
    boolean existsByStudentIdAndTermId(String studentId, String termId);
    @Query(value = """
        SELECT
            s.student_code AS studentCode,
            s.full_name AS fullName,
            s.class_name as className,
            t.full_name AS teacherName
        FROM advisor_assignments a
        JOIN students s ON a.student_id = s.id
        JOIN teachers t ON a.teacher_id = t.id
        where a.term_id =:term_id order by s.student_code
        
            """, nativeQuery = true)
    List<InternshipTermResponse> getALLSVPhanCong(@PathVariable String term_id);
    @Query(value = """
        SELECT s.id AS id,
               s.studentCode AS StudentCode,
               s.name AS name,
               s.email AS email,
               s.phone AS phone,
//               s.gender AS gender,
               s.class_name AS className,
               s.major AS major
        FROM advisor_assignment aa
        JOIN student s ON aa.student_id = s.id
        WHERE aa.teacher_id = :teacherId
        AND aa.internship_term_id = :termId
    """, nativeQuery = true)
    List<StudentProjection> findStudentsByTeacherAndTerm(
            String teacherId,
            String termId
    );
}
