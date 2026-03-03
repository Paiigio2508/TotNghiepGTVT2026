package com.example.backend.controller.student;

import com.example.backend.entity.WeeklyReport;
import com.example.backend.service.WeeklyReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/student/reports")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class StudentWeeklyReportController {


    private final  WeeklyReportService weeklyReportService;
    @PostMapping()
    public ResponseEntity<?> submitReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("deadlineId") String deadlineId,
            @RequestParam("userId") String userId,
            @RequestParam(required = false) String comment
    ) throws IOException {

        WeeklyReport report =
                weeklyReportService.submitReport(file, deadlineId,comment, userId);

        return ResponseEntity.ok(report);
    }
}
