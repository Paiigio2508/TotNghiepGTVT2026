package com.example.backend.controller.teacher;

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
@RequestMapping("/api/teacher/internship-terms")
@CrossOrigin("http://localhost:5173")
public class TeacherInternshipTermController {
    @Autowired
    InternshipTermService internshipTermService;
    @GetMapping()
    public ResponseEntity<?> getALLTermForTeacherLayout() {
        return ResponseEntity.ok(internshipTermService.getALL());
    }
}
