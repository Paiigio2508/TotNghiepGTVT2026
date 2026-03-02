package com.example.backend.controller.admin;

import com.example.backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/topic")
@CrossOrigin("http://localhost:5173")
public class AdminTopicController {
    @Autowired
    TopicService topicService;
    @GetMapping("/{termId}")
    public ResponseEntity<?> findTopicsbyTerm(
            @PathVariable String termId) {
        return ResponseEntity.ok(topicService.findTopicForAdmin(termId));
    }
    @PutMapping("/{topicId}/approve")
    public ResponseEntity<?> adminApprove(@PathVariable String topicId) {
        topicService.adminApproveTopic(topicId);
        return ResponseEntity.ok("Admin approved");
    }
}
