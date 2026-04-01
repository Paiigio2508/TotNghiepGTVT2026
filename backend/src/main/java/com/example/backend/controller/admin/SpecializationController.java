package com.example.backend.controller.admin;

import com.example.backend.entity.Specialization;
import com.example.backend.service.SpecializationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/specialization")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class SpecializationController {
    private final SpecializationService service;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Specialization specialization) {
        return ResponseEntity.ok(service.create(specialization));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Specialization specialization) {
        return ResponseEntity.ok(service.update(id, specialization));
    }

    @PutMapping("/updateTT/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return ResponseEntity.ok(service.deleteSpecialization(id));
    }
}
