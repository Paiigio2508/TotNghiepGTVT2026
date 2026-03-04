package com.example.backend.service;

import com.example.backend.dto.response.ChatRoomProjection;
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
        return chatRoomRepository
                .findByAdvisorAssignment_Student_Id(studentId)
                .orElse(null);
    }
    public List<ChatRoomProjection> getRoomByTeacher(String teacherId) {

        return chatRoomRepository
                .findRoomsByTeacherId(teacherId);

    }
}
