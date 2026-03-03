package com.example.backend.controller.student;

import com.example.backend.service.DeadlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/deadlines")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class StudentDeadLineController {

    private final DeadlineService deadlineService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getDeadlines(@PathVariable String userId) {
        return ResponseEntity.ok(
                deadlineService.getDeadlinesForStudent(userId)
        );
    }

    @GetMapping("/{deadlineId}/{userId}")
    public ResponseEntity<?> getDetail(
            @PathVariable String deadlineId,
            @PathVariable String userId
    ) {
        return ResponseEntity.ok(
                deadlineService.getDeadlineDetailForStudent(deadlineId, userId)
        );
    }
}
