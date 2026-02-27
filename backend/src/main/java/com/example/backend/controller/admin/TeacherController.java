package com.example.backend.controller.admin;

import com.example.backend.dto.request.UserRequest;
import com.example.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/teacher")
@CrossOrigin("http://localhost:5173")
public class TeacherController {
    @Autowired
    TeacherService teacherService;

    @GetMapping
    public ResponseEntity<?> getALL() {
        return ResponseEntity.ok(teacherService.getALL());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody UserRequest request) {
        teacherService.createTeacher(request);
        return ResponseEntity.ok("Tạo gv  thành công");
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody UserRequest request) {

        teacherService.updateTeacher(id, request);
        return ResponseEntity.ok("Cập nhật thành công");
    }
    @PutMapping("/updateTT/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}
