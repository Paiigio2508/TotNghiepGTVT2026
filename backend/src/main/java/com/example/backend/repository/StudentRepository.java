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
            select s.id as id,student_code as userCode, full_name as name, class_name as className, email, phone, 
             url_image as urlImage ,created_at as createdAt ,status  from users u join students s on u.id =s.user_id
            """, nativeQuery = true)
    List<UserResponse> getALLSTUDENT();

    boolean existsByStudentCode(String studentCode);
    Optional<Student> findByStudentCode(String studentCode);
}
