package com.example.backend.controller.teacher;

import com.example.backend.service.AdvisorAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/assignments")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class TeacherAdvisorAssignmentController {
    private final AdvisorAssignmentService service;
    @GetMapping("/students/{teacherId}/{termId}")
    public ResponseEntity<?> getStudents(
            @PathVariable String teacherId,
            @PathVariable String termId) {
        return ResponseEntity.ok(
                service.getStudentsByTerm(teacherId, termId)
        );
    }
}
