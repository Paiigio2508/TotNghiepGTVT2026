package com.example.backend.controller.student;

import com.example.backend.service.SpecializationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/specialization")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class SpecializationStudentController {
    private final SpecializationService service;
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok( service.getAll());
    }
}
