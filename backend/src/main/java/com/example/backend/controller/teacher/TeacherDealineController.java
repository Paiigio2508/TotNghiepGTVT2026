package com.example.backend.controller.teacher;

import com.example.backend.dto.request.DeadlineRequest;
import com.example.backend.service.DeadlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/dealines")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class TeacherDealineController {

    private final DeadlineService deadlineService;
    @GetMapping("/{internshipTermId}/{userId}")
    public ResponseEntity<?> getDeadlinesByTeacher(
            @PathVariable String internshipTermId,
            @PathVariable String userId) {
        return ResponseEntity.ok(
                deadlineService.getDeadlinesByTeacher(internshipTermId, userId)
        );
    }
    @PostMapping("/{userId}")
    public ResponseEntity<?> createDeadline(
            @PathVariable String userId,
            @RequestBody DeadlineRequest request
    ) {
        return ResponseEntity.ok(
                deadlineService.createDeadline(request, userId)
        );
    }

    @PutMapping("/{id}/{userId}")
    public ResponseEntity<?> updateDeadline(
            @PathVariable String id,
            @PathVariable String userId,
            @RequestBody DeadlineRequest request
    ) {
        return ResponseEntity.ok(
                deadlineService.updateDeadline(id, request, userId)
        );
    }
}
