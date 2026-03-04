package com.example.backend.controller;

import com.example.backend.dto.response.ChatRoomProjection;
import com.example.backend.entity.ChatMessage;
import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.Student;
import com.example.backend.entity.Teacher;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ChatRoomService chatRoomService;
    private final ChatMessageRepository chatMessageRepository;

    // 🎓 Sinh viên
    @GetMapping("/student/{userId}")
    public ResponseEntity<?> getRoomByStudent(@PathVariable String userId) {

        Student student = studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        ChatRoom room = chatRoomService.getRoomByStudent(student.getId());

        if (room == null) {
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "data", null
                    )
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "data", Map.of(
                                "id", room.getId()
                        )
                )
        );
    }

    // 👨‍🏫 Giảng viên
    @GetMapping("/teacher/{userId}")
    public ResponseEntity<?> getRoomsByTeacher(@PathVariable String userId) {

        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        List<ChatRoomProjection> rooms =
                chatRoomService.getRoomByTeacher(teacher.getId());

        return ResponseEntity.ok(rooms);
    }
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getMessagesByRoom(@PathVariable String roomId) {

        List<ChatMessage> messages =
                chatMessageRepository.findByChatRoom_IdOrderByCreatedAtAsc(roomId);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "data", messages
                )
        );
    }
}