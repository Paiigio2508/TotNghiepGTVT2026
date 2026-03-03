package com.example.backend.controller.teacher;

import com.example.backend.dto.response.TeacherWeeklyReportProjection;
import com.example.backend.entity.User;
import com.example.backend.entity.WeeklyReport;
import com.example.backend.service.DeadlineService;
import com.example.backend.service.WeeklyReportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/teacher/")
@CrossOrigin("http://localhost:5173")
public class TeacherWeeklyReportController {
    private final DeadlineService deadlineService;
    private final WeeklyReportService weeklyReportService;

    @GetMapping("/reports")
    public List<TeacherWeeklyReportProjection> getReports(
            @RequestParam String deadlineId,
            @RequestParam String userId
    ) {
        return deadlineService.getReportsByWeekAndDeadline(
                deadlineId, userId);
    }

    @GetMapping("/download-all")
    public void downloadAll(
            @RequestParam String deadlineId,
            @RequestParam String userId,
            HttpServletResponse response

    ) throws IOException {


        System.out.println(userId);
        List<WeeklyReport> reports =
                weeklyReportService.findAllByDeadlineAndTeacher(deadlineId, userId);

        response.setContentType("application/zip");
        response.setHeader("Content-Disposition",
                "attachment; filename=Week_Reports.zip");
        System.out.println("Total reports: " + reports.size());

        for (WeeklyReport report : reports) {
            System.out.println("File URL: " + report.getFileUrl());
        }
        try (ZipOutputStream zipOut =
                     new ZipOutputStream(response.getOutputStream())) {

            for (WeeklyReport report : reports) {

                if (report.getFileUrl() == null) continue;

                URL url = new URL(report.getFileUrl());

                try (InputStream inputStream = url.openStream()) {

                    ZipEntry zipEntry =
                            new ZipEntry(report.getOriginalFileName());

                    zipOut.putNextEntry(zipEntry);
                    inputStream.transferTo(zipOut);
                    zipOut.closeEntry();
                }
            }

            zipOut.finish();
        }
    }
}
