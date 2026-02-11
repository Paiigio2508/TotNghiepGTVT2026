package com.example.backend.controller;

import com.example.backend.service.InternshipTermService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/term")
@CrossOrigin("http://localhost:5173")
public class InternshipTermController {
    @Autowired
    InternshipTermService internshipTermService;
    @GetMapping
    public ResponseEntity<?> getALL() {
        return ResponseEntity.ok(internshipTermService.getALL());
    }
}
