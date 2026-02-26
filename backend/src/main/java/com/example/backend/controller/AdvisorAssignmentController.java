package com.example.backend.controller;

import com.example.backend.dto.response.StudentProjection;
import com.example.backend.service.AdvisorAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/assignments")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class AdvisorAssignmentController {

    private final AdvisorAssignmentService service;

    @GetMapping("/students/{termId}")
    public ResponseEntity<?> getStudentsForAssignment(@PathVariable String termId) {
        return ResponseEntity.ok(service.getStudentsForAssignment(termId));
    }
    @GetMapping("/teachers/{termId}")
    public ResponseEntity<?> getTeachers(@PathVariable String termId) {
        return ResponseEntity.ok(service.findTeachersForAssignment(termId));
    }
    @PostMapping("/auto/{termId}")
    public ResponseEntity<String> autoAssign(@PathVariable String termId) {
        service.autoAssign(termId);
        return ResponseEntity.ok("Phân công tự động thành công");
    }
    @GetMapping("/assigned/{termId}")
    public ResponseEntity<?> getAssigned(@PathVariable String termId) {
        return ResponseEntity.ok(
                service.getALLSVPhanCong(termId)
        );
    }
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestParam String teacherId,
            @RequestParam String termId
    ) {
        return ResponseEntity.ok(
                service.getStudentsByTerm(teacherId, termId)
        );
    }
}
