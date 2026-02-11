package com.example.backend.repository;

import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, String> {
    @Query(value = """
            select s.id as id, teacher_code as userCode, full_name as name, email,
                         phone,url_image as urlImage ,created_at as createdAt ,status    from users u  join teachers s on u.id =s.user_id
            """, nativeQuery = true)
    List<UserResponse> getALL();
}
