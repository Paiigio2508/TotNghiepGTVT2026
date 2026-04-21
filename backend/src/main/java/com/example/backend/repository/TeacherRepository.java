package com.example.backend.repository;

import com.example.backend.dto.response.TeacherProjection;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, String> {
    @Query(value = """
             select s.id as id, teacher_code as userCode, full_name as name, email,s.user_id as userID,u.ngay_sinh as ngaySinh, role,
            phone,url_image as urlImage ,created_at as createdAt,gender,s.status    from users u  join teachers s on u.id =s.user_id order by createdAt
              """, nativeQuery = true)
    List<UserResponse> getALL();

    boolean existsByTeacherCode(String teacherCode);

    Optional<Teacher> findByTeacherCode(String teacherCode);

    @Query(value = """
            SELECT
                t.id AS id,
                t.full_name AS name,
                s.email AS email,
                COUNT(DISTINCT a.id) AS assignedCount,
                GROUP_CONCAT(DISTINCT sp.name SEPARATOR ', ') AS specializations
            FROM teachers t
            JOIN users s
                ON t.user_id = s.id
            LEFT JOIN advisor_assignments a
                ON a.teacher_id = t.id
               AND a.term_id = :term_id
            LEFT JOIN teacher_specializations ts
                ON ts.teacher_id = t.id
            LEFT JOIN specialization sp
                ON sp.id = ts.specialization_id
            WHERE t.status = 0
            GROUP BY
                t.id,
                t.full_name,
                s.email;
                        """, nativeQuery = true)
    List<TeacherProjection> findTeachersForAssignment(@PathVariable String term_id);

    @Query(value = """
                SELECT * FROM teachers t
                WHERE t.user_id = :userId
            """, nativeQuery = true)
    Optional<Teacher> findByUserId(@Param("userId") String userId);
}
