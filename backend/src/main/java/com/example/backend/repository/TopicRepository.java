package com.example.backend.repository;

import com.example.backend.entity.Topic;
import com.example.backend.entity.Student;
import com.example.backend.util.status.TopicStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, String> {

    List<Topic> findByStudent(Student student);

    boolean existsByStudentAndStatus(
            Student student,
            TopicStatus status
    );

    Optional<Topic> findByStudentAndStatus(
            Student student,
            TopicStatus status
    );
}