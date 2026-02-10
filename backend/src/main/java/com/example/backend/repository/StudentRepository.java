package com.example.backend.repository;

import com.example.backend.dto.response.StudentResponse;
import com.example.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, String> {
    @Query(value = """
            select s.id as id,student_code as studentCode, full_name as name, class_name as class, email, phone, 
             url_image as urlImage ,status  from users u join students s on u.id =s.user_id
            """, nativeQuery = true)
    List<StudentResponse> getALLSTUDENT();
}
