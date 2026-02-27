package com.example.backend.controller.student;

import com.example.backend.service.AdvisorAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/internships")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class StudentInternshipController {
    private final AdvisorAssignmentService service;

    @GetMapping("/{studentId}")
    public ResponseEntity<?> getInternship(@PathVariable String studentId) {
        return ResponseEntity.ok(
                service.findInternshipInfoByStudentId(studentId)
        );
    }
}
