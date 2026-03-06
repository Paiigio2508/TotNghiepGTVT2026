package com.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.Deadline;
import com.example.backend.entity.Student;
import com.example.backend.entity.WeeklyReport;
import com.example.backend.exception.AppException;
import com.example.backend.repository.*;
import com.example.backend.util.status.WeeklyReportStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeeklyReportService {
    private final WeeklyReportRepository weeklyReportRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;
    private final DeadlineRepository deadlineRepository;
    private final StudentRepository studentRepository;
    private final Cloudinary cloudinary;

    @Transactional
    public WeeklyReport submitReport(
            MultipartFile file,
            String deadlineId,
            String comment,
            String userId
    ) {

        try {

            // 1️⃣ Lấy student trực tiếp
            Student student = studentRepository
                    .findByUser_Id(userId)
                    .orElseThrow(() -> new AppException("Student not found"));

            // 2️⃣ Lấy deadline
            Deadline deadline = deadlineRepository.findById(deadlineId)
                    .orElseThrow(() -> new AppException("Deadline not found"));

            String termId = deadline.getInternshipTerm().getId();

            // 3️⃣ Lấy assignment
            AdvisorAssignment assignment = advisorAssignmentRepository
                    .findByStudentIdAndTermId(student.getId(), termId)
                    .orElseThrow(() -> new AppException("Assignment not found"));

            // 4️⃣ Tìm report
            WeeklyReport report = weeklyReportRepository
                    .findByAdvisorAssignmentAndDeadline(assignment, deadline)
                    .orElseGet(() -> {
                        WeeklyReport r = new WeeklyReport();
                        r.setAdvisorAssignment(assignment);
                        r.setDeadline(deadline);
                        r.setWeekNo(deadline.getWeekNo());
                        return r;
                    });

            // 5️⃣ Upload file
            String originalName = file.getOriginalFilename();
            report.setOriginalFileName(originalName);

            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String publicId = "weekly_reports/"
                    + assignment.getId()
                    + "_week"
                    + deadline.getWeekNo();

            File tempFile = File.createTempFile("weekly-report-", extension);
            file.transferTo(tempFile);

            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    tempFile,
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "public_id", publicId,
                            "overwrite", true
                    )
            );

            tempFile.delete();

            String fileUrl = uploadResult.get("secure_url").toString();

            // 6️⃣ Update report
            LocalDateTime now = LocalDateTime.now();

            report.setFileUrl(fileUrl);
            report.setSubmitDate(now);
            report.setComment(comment);

            report.setStatus(
                    now.isAfter(deadline.getDueDate())
                            ? WeeklyReportStatus.LATE
                            : WeeklyReportStatus.SUBMITTED
            );

            return weeklyReportRepository.save(report);

        } catch (Exception e) {
            throw new AppException("Submit report failed: " + e.getMessage());
        }
    }

    public List<WeeklyReport> findAllByDeadlineAndTeacher(
            String deadlineId,
            String userId
    ) {

        return weeklyReportRepository.findAllByDeadlineAndTeacher(deadlineId, userId);
    }
}
