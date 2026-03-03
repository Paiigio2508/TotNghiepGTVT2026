package com.example.backend.service;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.repository.*;
import com.example.backend.util.status.WeeklyReportStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
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
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;
    @Transactional
    public WeeklyReport submitReport(
            MultipartFile file,
            String deadlineId,
            String comment,
            String userId
    ) {

        try {

            // 1️⃣ Lấy user + student
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException("User not found"));

            Student student = studentRepository
                    .findByUser_Id(user.getId())
                    .orElseThrow(() -> new AppException("Student not found"));

            // 2️⃣ Lấy deadline
            Deadline deadline = deadlineRepository.findById(deadlineId)
                    .orElseThrow(() -> new AppException("Deadline not found"));

            String termId = deadline.getInternshipTerm().getId();

            AdvisorAssignment assignment =
                    advisorAssignmentRepository
                            .findByStudentIdAndTermId(student.getId(), termId)
                            .orElseThrow(() -> new AppException("Assignment not found"));

            // 3️⃣ Kiểm tra đã tồn tại report chưa
            WeeklyReport report = weeklyReportRepository
                    .findByAdvisorAssignmentAndDeadline(assignment, deadline)
                    .orElse(null);

            boolean isUpdate = report != null;

            if (!isUpdate) {
                report = new WeeklyReport();
                report.setAdvisorAssignment(assignment);
                report.setDeadline(deadline);
                report.setWeekNo(deadline.getWeekNo());
            }

            // 4️⃣ Nếu update → xóa file cũ trên Cloudinary
            if (isUpdate && report.getFileUrl() != null) {

                String oldUrl = report.getFileUrl();

                String publicId = oldUrl
                        .substring(oldUrl.indexOf("weekly_reports/"))
                        .replaceAll("\\.[^.]+$", "");

                cloudinary.uploader().destroy(
                        publicId,
                        ObjectUtils.asMap("resource_type", "raw")
                );
            }

            // 5️⃣ Upload file mới

            String originalName = file.getOriginalFilename();
            report.setOriginalFileName(originalName);   // ✅ lưu tên gốc

            // Lấy extension (.pdf, .docx...)
            String extension = originalName.substring(originalName.lastIndexOf("."));

            // public_id an toàn (KHÔNG dùng tên gốc)
            String publicId = "weekly_reports/"
                    + student.getId()
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

            // 6️⃣ Cập nhật thông tin
            report.setFileUrl(fileUrl);
            report.setSubmitDate(LocalDateTime.now());
            report.setComment(comment);

            if (LocalDateTime.now().isAfter(deadline.getDueDate())) {
                report.setStatus(WeeklyReportStatus.LATE);
            } else {
                report.setStatus(WeeklyReportStatus.SUBMITTED);
            }

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
