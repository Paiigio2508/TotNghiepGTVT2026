package com.example.backend.controller.admin;

import com.example.backend.entity.InternshipTerm;
import com.example.backend.service.InternshipTermService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/internship-terms")
@CrossOrigin("http://localhost:5173")
public class InternshipTermController {
    @Autowired
    InternshipTermService internshipTermService;
    @GetMapping()
    public ResponseEntity<?> getALL() {
        return ResponseEntity.ok(internshipTermService.getALL());
    }

    // Thêm mới
    @PostMapping()
    public ResponseEntity<?> create(@RequestBody InternshipTerm term) {
        return ResponseEntity.ok(internshipTermService.create(term));
    }

    // Cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody InternshipTerm term) {
        return ResponseEntity.ok(internshipTermService.update(id, term));
    }

}
