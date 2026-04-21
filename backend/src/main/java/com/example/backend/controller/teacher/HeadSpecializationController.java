package com.example.backend.controller.teacher;

import com.example.backend.dto.request.UpdateTeacherSpecializationRequest;
import com.example.backend.service.SpecializationService;
import com.example.backend.service.TeacherService;
import com.example.backend.service.TeacherSpecializationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/head/specialization")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class HeadSpecializationController {
    private final SpecializationService service;
    private final TeacherService teacherService;
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
    @GetMapping("/getTeacher")
    public ResponseEntity<?> getAllTeacher() {
        return ResponseEntity.ok(teacherService.getALL());
    }
    @GetMapping("/term/{termId}")
    public ResponseEntity<?> getTeacherSpecializationTerm(@PathVariable String termId) {
        return ResponseEntity.ok(teacherService.getByTerm(termId));
    }
//    @PostMapping("/term/save")
//    public ResponseEntity<?> saveTeacherSpecializationTerm(
//            @RequestBody UpdateTeacherSpecializationTermRequest request
//    ) {
//        teacherSpecializationTermService.saveOne(request);
//        return ResponseEntity.ok(Map.of("message", "Lưu thành công"));
//    }
//
//    @PostMapping("/term/save-bulk")
//    public ResponseEntity<?> saveTeacherSpecializationTermBulk(
//            @RequestBody List<UpdateTeacherSpecializationTermRequest> requests
//    ) {
//        teacherSpecializationTermService.saveBulk(requests);
//        return ResponseEntity.ok(Map.of("message", "Lưu toàn bộ thành công"));
//    }
}
