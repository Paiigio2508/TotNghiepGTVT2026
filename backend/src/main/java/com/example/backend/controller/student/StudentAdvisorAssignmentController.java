package com.example.backend.controller.student;

import com.example.backend.dto.response.StudentCurrentAssignmentView;
import com.example.backend.service.AdvisorAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/advisor-assignments")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class StudentAdvisorAssignmentController {
    private final AdvisorAssignmentService advisorAssignmentService;

    @GetMapping("/student-user/{userId}")
    public ResponseEntity<StudentCurrentAssignmentView> getCurrentAssignmentByStudentUser(
            @PathVariable String userId
    ) {
        return ResponseEntity.ok(
                advisorAssignmentService.getCurrentAssignmentByStudentUser(userId)
        );
    }

}
