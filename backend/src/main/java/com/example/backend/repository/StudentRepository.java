package com.example.backend.repository;

import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    @Query(value = """
            select s.id as id,student_code as userCode, full_name as name, class_name as className, email, phone,gender,
             url_image as urlImage ,created_at as createdAt ,s.status  from users u join students s on u.id =s.user_id order by  createdAt
            """, nativeQuery = true)
    List<UserResponse> getALLSTUDENT();

    boolean existsByStudentCode(String studentCode);

    Optional<Student> findByStudentCode(String studentCode);

    @Query(value = """
                SELECT s.*
                FROM students s
                WHERE s.status = 'DU_DIEU_KIEN'
                AND s.id NOT IN (
                    SELECT a.student_id
                    FROM advisor_assignments a
                    JOIN internship_terms t ON a.term_id = t.id
                    WHERE t.status = 'DANG_DIEN_RA'
                )
                AND s.id NOT IN (
                    SELECT a.student_id
                    FROM advisor_assignments a
                    JOIN internship_terms t ON a.term_id = t.id
                    WHERE t.status = 'KET_THUC'
                    AND a.result = 'DAT'
                )
            """, nativeQuery = true)
    List<Student> getALLSVDuDieuKien(String termId);
}
