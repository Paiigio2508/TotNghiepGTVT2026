package com.example.backend.controller;

import com.example.backend.dto.request.UserRequest;
import com.example.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/student")
@CrossOrigin("http://localhost:5173")
public class StudentController {
    @Autowired
    StudentService studentService;

    @GetMapping
    public ResponseEntity<?> getALL() {
        return ResponseEntity.ok(studentService.getALLSTUDENT());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody UserRequest request) {
        studentService.createStudent(request);
        return ResponseEntity.ok("Tạo sinh viên thành công");
    }
    @PostMapping("/import")
    public ResponseEntity<?> importStudent(@RequestParam("file") MultipartFile file) {
        studentService.importStudent(file);
        return ResponseEntity.ok("Import thành công");
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody UserRequest request) {

        studentService.updateStudent(id, request);
        return ResponseEntity.ok("Cập nhật thành công");
    }

    @PutMapping("/updateTT/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}
