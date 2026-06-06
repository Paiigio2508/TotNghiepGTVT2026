package com.example.backend.controller.teacher;

import com.example.backend.dto.response.KyDashboardResponse;
import com.example.backend.dto.response.TeacherDashboardResponse;
import com.example.backend.service.TeacherDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/dashboard")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class TeacherDashboardController {

    private final TeacherDashboardService teacherDashboardService;

    @GetMapping
    public ResponseEntity<TeacherDashboardResponse> layThongKeDashboard(
            @RequestParam String idKy,
            Principal principal
    ) {
        return ResponseEntity.ok(teacherDashboardService.layThongKeDashboard(idKy, principal));
    }
}