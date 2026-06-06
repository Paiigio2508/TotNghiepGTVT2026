package com.example.backend.controller.admin;


import com.example.backend.dto.response.AdminDashboardResponse;
import com.example.backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public AdminDashboardResponse
    getDashboard(@RequestParam String termId) {
        return adminDashboardService.getDashboard(termId);
    }
}