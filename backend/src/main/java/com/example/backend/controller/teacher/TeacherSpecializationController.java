package com.example.backend.controller.teacher;

import com.example.backend.dto.request.UpdateTeacherSpecializationRequest;
import com.example.backend.service.SpecializationService;
import com.example.backend.service.TeacherSpecializationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/teacher/specialization")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class TeacherSpecializationController {
    private final SpecializationService service;
    private final TeacherSpecializationService teacherSpecializationService;
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
    @PutMapping()
    public ResponseEntity<?> updateSpecializations(
            @RequestBody UpdateTeacherSpecializationRequest request
    ) {
        service.updateSpecializations(request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật thế mạnh thành công"
        ));
    }
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getSpecializationHistory(@PathVariable String userId) {
        return ResponseEntity.ok(service.getHistory(userId));
    }
    @GetMapping("/by-teacher/{userId}")
    public ResponseEntity<?> getSpecializationHistor(@PathVariable String userId) {
        return ResponseEntity.ok(teacherSpecializationService.getCurrentSpecializations(userId));
    }
}
