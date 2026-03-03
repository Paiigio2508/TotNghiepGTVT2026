package com.example.backend.repository;

import com.example.backend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface ChatRoomRepository  extends JpaRepository<ChatRoom,String> {
    Optional<ChatRoom> findByAdvisorAssignment_Student_Id(String studentId);

    List<ChatRoom> findByAdvisorAssignment_Teacher_Id(String teacherId);
}
