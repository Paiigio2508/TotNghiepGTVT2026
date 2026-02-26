package com.example.backend.controller;

import com.example.backend.dto.response.StudentProjection;
import com.example.backend.service.AdvisorAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class AdvisorAssignmentController {

    private final AdvisorAssignmentService service;

    @GetMapping("/admin/assignments/students/{termId}")
    public ResponseEntity<?> getStudentsForAssignment(@PathVariable String termId) {
        return ResponseEntity.ok(service.getStudentsForAssignment(termId));
    }
    @GetMapping("/admin/assignments/teachers/{termId}")
    public ResponseEntity<?> getTeachers(@PathVariable String termId) {
        return ResponseEntity.ok(service.findTeachersForAssignment(termId));
    }
    @PostMapping("/admin/assignments/auto/{termId}")
    public ResponseEntity<String> autoAssign(@PathVariable String termId) {
        service.autoAssign(termId);
        return ResponseEntity.ok("Phân công tự động thành công");
    }
    @GetMapping("/admin/assignments/assigned/{termId}")
    public ResponseEntity<?> getAssigned(@PathVariable String termId) {
        return ResponseEntity.ok(
                service.getALLSVPhanCong(termId)
        );
    }
    @GetMapping("/teacher/assignments/students/{teacherId}/{termId}")
    public ResponseEntity<?> getStudents(
            @PathVariable String teacherId,
            @PathVariable String termId) {
        return ResponseEntity.ok(
                service.getStudentsByTerm(teacherId, termId)
        );
    }
}
