package com.example.backend.controller;

import com.example.backend.dto.request.FinalReportRequest;
import com.example.backend.dto.response.FinalReportView;
import com.example.backend.service.FinalReportService;
import com.example.backend.util.status.FinalReportStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/final-reports")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class FinalReportController {

    private final FinalReportService finalReportService;

    /**
     * Sinh viên nộp hoặc nộp lại final report
     */
    @PostMapping("/submit")
    public ResponseEntity<FinalReportView> submitFinalReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("advisorAssignmentId") String advisorAssignmentId
    ) throws IOException {
        return ResponseEntity.ok(
                finalReportService.submitFinalReport(file, advisorAssignmentId)
        );
    }
    /**
     * Giảng viên yêu cầu sinh viên sửa lại
     */
    @PutMapping("/{id}/request-revision")
    public ResponseEntity<FinalReportView> requestRevision(
            @PathVariable String id,
            @RequestBody FinalReportRequest request
    ) {
        return ResponseEntity.ok(finalReportService.requestRevision(id, request));
    }

    /**
     * Giảng viên duyệt báo cáo và gửi admin
     */
    @PutMapping("/{id}/teacher-approve")
    public ResponseEntity<FinalReportView> teacherApprove(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(finalReportService.teacherApprove(id));
    }

    /**
     * Admin duyệt cuối
     */
    @PutMapping("/{id}/admin-approve")
    public ResponseEntity<FinalReportView> adminApprove(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(finalReportService.adminApprove(id));
    }

    /**
     * Chấm điểm final report
     */
    @PutMapping("/{id}/grade")
    public ResponseEntity<FinalReportView> gradeFinalReport(
            @PathVariable String id,
            @RequestBody FinalReportRequest request
    ) {
        return ResponseEntity.ok(finalReportService.gradeFinalReport(id, request));
    }

    /**
     * Admin xem toàn bộ final report theo kỳ
     */
    @GetMapping("/term/{termId}")
    public ResponseEntity<List<FinalReportView>> getByTerm(
            @PathVariable String termId
    ) {
        return ResponseEntity.ok(finalReportService.getByTerm(termId));
    }

    /**
     * Giảng viên xem final report của sinh viên mình hướng dẫn theo kỳ
     */
    @GetMapping("/teacher-user/{userId}/term/{termId}")
    public ResponseEntity<List<FinalReportView>> getByTeacherUserAndTerm(
            @PathVariable String userId,
            @PathVariable String termId
    ) {
        return ResponseEntity.ok(
                finalReportService.getByTeacherUserAndTerm(userId, termId)
        );
    }

    /**
     * Admin xem danh sách báo cáo đang chờ duyệt cuối
     */
    @GetMapping("/waiting-admin-approve/term/{termId}")
    public ResponseEntity<List<FinalReportView>> getWaitingAdminApprove(
            @PathVariable String termId
    ) {
        return ResponseEntity.ok(finalReportService.getWaitingAdminApprove(termId));
    }

    /**
     * Sinh viên xem final report của mình theo advisorAssignmentId
     */
    @GetMapping("/advisor-assignment/{advisorAssignmentId}")
    public ResponseEntity<FinalReportView> getByAdvisorAssignmentId(
            @PathVariable String advisorAssignmentId
    ) {
        return finalReportService.getByAdvisorAssignmentId(advisorAssignmentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /**
     * Lọc final report theo trạng thái và kỳ
     * Ví dụ:
     * /api/final-reports/filter?status=SUBMITTED&termId=abc
     */
    @GetMapping("/filter")
    public ResponseEntity<List<FinalReportView>> getByStatusAndTerm(
            @RequestParam FinalReportStatus status,
            @RequestParam String termId
    ) {
        return ResponseEntity.ok(finalReportService.getByStatusAndTerm(status, termId));
    }
}