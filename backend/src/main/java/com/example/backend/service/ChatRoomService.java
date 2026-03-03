package com.example.backend.service;

import com.example.backend.entity.ChatRoom;
import com.example.backend.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    public ChatRoom getRoomByStudent(String studentId) {

        System.out.println("StudentId nhận được: " + studentId);

        return chatRoomRepository
                .findByAdvisorAssignment_Student_Id(studentId)
                .orElse(null);
    }
    public List<ChatRoom> getRoomByTeacher(String teacherId) {

        return chatRoomRepository
                .findByAdvisorAssignment_Teacher_Id(teacherId);

    }
}
