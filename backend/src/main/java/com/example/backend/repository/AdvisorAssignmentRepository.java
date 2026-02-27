package com.example.backend.repository;

import com.example.backend.dto.response.InternshipStudentView;
import com.example.backend.dto.response.InternshipTermResponse;
import com.example.backend.dto.response.StudentProjection;
import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

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
                   s.student_code AS studentCode,
                   s.full_name AS name,
                   u.email AS email,
                   u.phone AS phone,
                   u.url_image as urlImage,
                   u.gender AS gender,
                   s.class_name AS className,
                   s.major AS major
            FROM advisor_assignments aa
            JOIN teachers t ON t.id = aa.teacher_id
            JOIN students s ON aa.student_id = s.id
            JOIN users u ON u.id = s.user_id
            WHERE t.user_id = :userId
            AND aa.term_id = :termId
            """, nativeQuery = true)
    List<StudentProjection> findStudentsByTeacherAndTerm(String userId, String termId);


    @Query(value = """
            select
                i.name as nameIntern,
                s.full_name as studentName,
                us.email as studentEmail,
                us.phone as studentPhone,
                s.class_name as studentClassName,
                s.student_code as studentCode,
                s.major as studentMajor,
                s.status as studentStatus,

                i.registration_deadline as registrationDeadline,
                i.start_date as startDate,
                i.end_date as endDate,
                aa.result as result,
                i.status as termStatus,

                t.teacher_code as teacherCode,
                t.full_name as teacherName,
                ut.email as teacherEmail,
                ut.phone as teacherPhone
            from students s
            join users us on us.id = s.user_id
            left join advisor_assignments aa on s.id = aa.student_id
            left join internship_terms i on i.id = aa.term_id
            left join teachers t on t.id = aa.teacher_id
            left join users ut on ut.id = t.user_id

            where s.user_id = :studentId
                                """, nativeQuery = true)
    List<InternshipStudentView> findInternshipInfoByStudentId(@PathVariable("studentId") String studentId);

    Optional<AdvisorAssignment> findByStudent(Student student);
}
