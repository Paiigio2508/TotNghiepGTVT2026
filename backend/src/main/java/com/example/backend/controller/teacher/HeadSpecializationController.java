package com.example.backend.controller.teacher;

import com.example.backend.dto.request.SaveTeacherSpecializationTermRequest;
import com.example.backend.service.SpecializationService;
import com.example.backend.service.StudentService;
import com.example.backend.service.TeacherSpecializationTermService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/head/specialization")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class HeadSpecializationController {

    private final SpecializationService service;
    private final TeacherSpecializationTermService teacherSpecializationTermService;
    private final StudentService studentService;
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
    @GetMapping("/teacher-assignment/history/{termId}")
    public ResponseEntity<?> getTeacherSpecializationHistory(@PathVariable String termId) {
        return ResponseEntity.ok(teacherSpecializationTermService.getHistoryByTerm(termId));
    }
    @GetMapping("/teacher-assignment/{termId}")
    public ResponseEntity<?> getTeacherSpecializationTerm(@PathVariable String termId) {
        return ResponseEntity.ok(teacherSpecializationTermService.getTeacherSpecializationTerm(termId));
    }

    @PostMapping("/teacher-assignment")
    public ResponseEntity<?> saveTeacherSpecializationTerm(
            @RequestBody SaveTeacherSpecializationTermRequest request
    ) {
        teacherSpecializationTermService.saveTeacherSpecializationTerm(request);
        return ResponseEntity.ok(Map.of("message", "Lưu phân công giảng viên thành công"));
    }

    @PostMapping("/teacher-assignment/bulk")
    public ResponseEntity<?> saveTeacherSpecializationTermBulk(
            @RequestBody List<SaveTeacherSpecializationTermRequest> requests
    ) {
        teacherSpecializationTermService.saveTeacherSpecializationTermBulk(requests);
        return ResponseEntity.ok(Map.of("message", "Lưu toàn bộ phân công thành công"));
    }
    @GetMapping("/student-stat")
    public ResponseEntity<?> getStudentStats() {
        return ResponseEntity.ok(studentService.getStudentStats());
    }
}