package com.example.backend.controller.student;

import com.example.backend.dto.request.UserRequest;
import com.example.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/student/student")
@CrossOrigin("http://localhost:5173")
public class StudentController {

    private final StudentService studentService;
    @PutMapping("/specialization/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody UserRequest request) {

        studentService.updateStudentSpecialization(id, request);
        return ResponseEntity.ok("Cập nhật thành công");
    }

}
