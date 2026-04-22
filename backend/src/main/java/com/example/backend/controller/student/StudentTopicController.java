package com.example.backend.controller.student;

import com.example.backend.dto.request.TopicRequest;
import com.example.backend.entity.Topic;
import com.example.backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class StudentTopicController {

    private final TopicService topicService;

    // Lấy danh sách đề tài của chính mình
    @GetMapping("/topic/{userId}")
    public List<Topic> getByUser(@PathVariable String userId) {
        return topicService.getTopicsByUser(userId);
    }

    // Tạo đề tài
    @PostMapping("/topic/{userId}")
    public Topic createTopic(
            @PathVariable String userId,
            @RequestBody TopicRequest request
    ) {
        return topicService.createTopicByUser(userId, request);
    }

    // Update
    @PutMapping("/topic/{topicId}/{userId}")
    public Topic updateTopic(
            @PathVariable String topicId,
            @PathVariable String userId,
            @RequestBody TopicRequest request
    ) {
        return topicService.updateTopicByUser(topicId, userId, request);
    }

    // Cancel
    @PutMapping("/topic/cancel/{topicId}/{userId}")
    public void cancelTopic(
            @PathVariable String topicId,
            @PathVariable String userId
    ) {
        topicService.cancelTopicByUser(topicId, userId);
    }
}