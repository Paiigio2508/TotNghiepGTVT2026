package com.example.backend.controller.student;

import com.example.backend.dto.request.TopicRequest;
import com.example.backend.entity.Topic;
import com.example.backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class StudentTopicController {

    private final TopicService topicService;

    // ================= GET =================
    @GetMapping("/topic/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable String userId) {
        List<Topic> topics = topicService.getTopicsByUser(userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", topics
        ));
    }

    // ================= CREATE =================
    @PostMapping("/topic/{userId}")
    public ResponseEntity<?> createTopic(
            @PathVariable String userId,
            @RequestBody TopicRequest request
    ) {
        topicService.createTopicByUser(userId, request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đăng ký đề tài thành công"
        ));
    }

    // ================= UPDATE =================
    @PutMapping("/topic/{topicId}/{userId}")
    public ResponseEntity<?> updateTopic(
            @PathVariable String topicId,
            @PathVariable String userId,
            @RequestBody TopicRequest request
    ) {
        Topic topic = topicService.updateTopicByUser(topicId, userId, request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật đề tài thành công",
                "data", topic
        ));
    }

    // ================= CANCEL =================
    @PutMapping("/topic/cancel/{topicId}/{userId}")
    public ResponseEntity<?> cancelTopic(
            @PathVariable String topicId,
            @PathVariable String userId
    ) {
        topicService.cancelTopicByUser(topicId, userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Hủy đề tài thành công"
        ));
    }
}