package com.example.backend.controller.teacher;

import com.example.backend.service.InternshipTermService;
import com.example.backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/teacher/topic")
@CrossOrigin("http://localhost:5173")
public class TeacherTopicController {
    private final TopicService topicService;
    @GetMapping("/{userID}/{termId}")
    public ResponseEntity<?> findTopicsByTeacherAndTerm(
                                                        @PathVariable String userID,
                                                        @PathVariable String termId) {
        return ResponseEntity.ok(topicService.findTopicsByTeacherAndTerm(userID,termId));
    }

    @PutMapping("/{topicId}/approve")
    public ResponseEntity<?> approveTopic(@PathVariable String topicId) {
        topicService.approveTopic(topicId);
        return ResponseEntity.ok("Approved");
    }
    @PutMapping("/{topicId}/reject")
    public ResponseEntity<?> rejectTopic(@PathVariable String topicId) {
        topicService.rejectTopic(topicId);
        return ResponseEntity.ok("Rejected");
    }
}
