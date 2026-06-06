package com.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.dto.request.FinalReportRequest;
import com.example.backend.dto.response.FinalReportView;
import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.FinalReport;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.exception.AppException;
import com.example.backend.repository.AdvisorAssignmentRepository;
import com.example.backend.repository.FinalReportRepository;
import com.example.backend.util.status.FinalReportStatus;
import com.example.backend.util.status.NotificationType;
import com.example.backend.util.status.TermStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FinalReportService {

    /*
     * Flow thời gian:
     * - Mở nộp trước ngày kết thúc kỳ 1 tháng
     * - Cho nộp trong 3 tuần kể từ ngày mở
     * - Sau đó khóa nộp để GV/Admin duyệt và chuẩn bị bảo vệ
     */
    private static final long FINAL_REPORT_OPEN_DURATION_DAYS = 21;

    private final FinalReportRepository finalReportRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;
    private final Cloudinary cloudinary;
    private final FinalReportAsyncNotificationService finalReportAsyncNotificationService;

    /**
     * Sinh viên nộp hoặc nộp lại final report.
     */
    @Transactional
    public FinalReportView submitFinalReport(
            MultipartFile file,
            String advisorAssignmentId
    ) {
        try {
            validateSubmitRequest(file, advisorAssignmentId);

            AdvisorAssignment assignment = advisorAssignmentRepository.findById(advisorAssignmentId)
                    .orElseThrow(() -> new AppException("Không tìm thấy phân công giảng viên hướng dẫn"));

            validateFinalReportTime(assignment);

            FinalReport finalReport = finalReportRepository
                    .findByAdvisorAssignment_Id(advisorAssignmentId)
                    .orElseGet(FinalReport::new);

            if (finalReport.getId() != null) {
                if (finalReport.getStatus() == FinalReportStatus.TEACHER_APPROVED
                        || finalReport.getStatus() == FinalReportStatus.ADMIN_APPROVED
                        || finalReport.getStatus() == FinalReportStatus.GRADED) {
                    throw new AppException("Báo cáo đã được duyệt, không thể nộp lại");
                }
            }

            String originalName = file.getOriginalFilename();

            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String publicId = "final_reports/" + assignment.getId();

            File tempFile = File.createTempFile("final-report-", extension);
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

            finalReport.setAdvisorAssignment(assignment);
            finalReport.setFileUrl(fileUrl);
            finalReport.setOriginalFileName(originalName);
            finalReport.setSubmitDate(LocalDateTime.now());
            finalReport.setStatus(FinalReportStatus.SUBMITTED);

            finalReportRepository.save(finalReport);

            return getViewByAdvisorAssignmentId(advisorAssignmentId);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("Nộp báo cáo cuối kỳ thất bại: " + e.getMessage());
        }
    }

    /**
     * Giảng viên yêu cầu sinh viên sửa lại.
     */
    @Transactional
    public FinalReportView requestRevision(String finalReportId, FinalReportRequest request) {
        if (!StringUtils.hasText(request.getComment())) {
            throw new AppException("Vui lòng nhập nhận xét cho sinh viên");
        }

        FinalReport finalReport = getFinalReportEntity(finalReportId);

        if (finalReport.getStatus() != FinalReportStatus.SUBMITTED) {
            throw new AppException("Chỉ có thể yêu cầu sửa báo cáo đang ở trạng thái đã nộp");
        }

        finalReport.setComment(request.getComment());
        finalReport.setStatus(FinalReportStatus.NEED_REVISION);

        finalReportRepository.save(finalReport);

        // Gửi notification + mail chạy nền
        finalReportAsyncNotificationService.sendRevisionNotificationAndMail(
                finalReport.getId(),
                request.getComment()
        );

        return getViewByAdvisorAssignmentId(finalReport.getAdvisorAssignment().getId());
    }

    /**
     * Giảng viên duyệt và gửi lên admin.
     */
    @Transactional
    public FinalReportView teacherApprove(String finalReportId) {
        FinalReport finalReport = getFinalReportEntity(finalReportId);

        if (finalReport.getStatus() != FinalReportStatus.SUBMITTED) {
            throw new AppException("Chỉ có thể duyệt báo cáo đang ở trạng thái đã nộp");
        }

        finalReport.setStatus(FinalReportStatus.TEACHER_APPROVED);

        finalReportRepository.save(finalReport);

        // Gửi notification + mail chạy nền
        finalReportAsyncNotificationService.sendApprovalNotificationAndMail(
                finalReport.getId(),
                "Báo cáo cuối kỳ đã được giảng viên duyệt",
                "Báo cáo cuối kỳ của bạn đã được giảng viên hướng dẫn duyệt và gửi lên admin chờ duyệt cuối.",
                "Báo cáo cuối kỳ đã được giảng viên duyệt",
                """
                Xin chào %s,

                Báo cáo cuối kỳ của bạn đã được giảng viên hướng dẫn duyệt.

                Thông tin báo cáo:
                - Đề tài: %s
                - Trạng thái: Đã được giảng viên duyệt, đang chờ admin duyệt cuối.

                Vui lòng tiếp tục theo dõi trạng thái báo cáo trên hệ thống.

                Trân trọng.
                """,
                NotificationType.FINAL_REPORT_TEACHER_APPROVED
        );

        return getViewByAdvisorAssignmentId(finalReport.getAdvisorAssignment().getId());
    }

    /**
     * Admin duyệt cuối.
     */
    @Transactional
    public FinalReportView adminApprove(String finalReportId) {
        FinalReport finalReport = getFinalReportEntity(finalReportId);

        if (finalReport.getStatus() != FinalReportStatus.TEACHER_APPROVED) {
            throw new AppException("Chỉ có thể duyệt báo cáo đã được giảng viên duyệt");
        }

        finalReport.setStatus(FinalReportStatus.ADMIN_APPROVED);

        finalReportRepository.save(finalReport);

        // Gửi notification + mail chạy nền
        finalReportAsyncNotificationService.sendApprovalNotificationAndMail(
                finalReport.getId(),
                "Báo cáo cuối kỳ đã được admin duyệt",
                "Báo cáo cuối kỳ của bạn đã được admin duyệt cuối.",
                "Báo cáo cuối kỳ đã được admin duyệt",
                """
                Xin chào %s,

                Báo cáo cuối kỳ của bạn đã được admin duyệt cuối.

                Thông tin báo cáo:
                - Đề tài: %s
                - Trạng thái: Admin đã duyệt cuối.

                Vui lòng tiếp tục theo dõi điểm và kết quả trên hệ thống.

                Trân trọng.
                """,
                NotificationType.FINAL_REPORT_ADMIN_APPROVED
        );

        return getViewByAdvisorAssignmentId(finalReport.getAdvisorAssignment().getId());
    }

    /**
     * Nhập điểm final report.
     */
    @Transactional
    public FinalReportView gradeFinalReport(String finalReportId, FinalReportRequest request) {
        FinalReport finalReport = getFinalReportEntity(finalReportId);

        if (request.getScore() == null) {
            throw new AppException("Vui lòng nhập điểm");
        }

        if (request.getScore() < 0 || request.getScore() > 10) {
            throw new AppException("Điểm phải nằm trong khoảng từ 0 đến 10");
        }

        if (finalReport.getStatus() != FinalReportStatus.ADMIN_APPROVED
                && finalReport.getStatus() != FinalReportStatus.GRADED) {
            throw new AppException("Chỉ có thể chấm điểm sau khi admin đã duyệt cuối");
        }

        finalReport.setScore(request.getScore());
        finalReport.setStatus(FinalReportStatus.GRADED);

        finalReportRepository.save(finalReport);

        // Gửi notification + mail chạy nền
        finalReportAsyncNotificationService.sendGradeNotificationAndMail(
                finalReport.getId(),
                request.getScore()
        );

        return getViewByAdvisorAssignmentId(finalReport.getAdvisorAssignment().getId());
    }

    /**
     * Admin xem tất cả final report đã nộp theo kỳ.
     */
    public List<FinalReportView> getByTerm(String termId) {
        return finalReportRepository.findAllViewByTermId(termId);
    }

    /**
     * Giảng viên xem final report của sinh viên mình hướng dẫn theo kỳ.
     */
    public List<FinalReportView> getByTeacherUserAndTerm(String userId, String termId) {
        return finalReportRepository.findAllViewByTeacherUserIdAndTermId(userId, termId);
    }

    /**
     * Admin xem danh sách báo cáo đang chờ duyệt cuối.
     */
    public List<FinalReportView> getWaitingAdminApprove(String termId) {
        return finalReportRepository.findAllViewByStatusAndTermId(
                FinalReportStatus.TEACHER_APPROVED,
                termId
        );
    }

    /**
     * Sinh viên xem final report của mình.
     */
    public Optional<FinalReportView> getByAdvisorAssignmentId(String advisorAssignmentId) {
        return finalReportRepository.findViewByAdvisorAssignmentId(advisorAssignmentId);
    }

    /**
     * Admin/GV lọc theo trạng thái và kỳ.
     */
    public List<FinalReportView> getByStatusAndTerm(FinalReportStatus status, String termId) {
        return finalReportRepository.findAllViewByStatusAndTermId(status, termId);
    }

    private FinalReport getFinalReportEntity(String id) {
        return finalReportRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy báo cáo cuối kỳ"));
    }

    private FinalReportView getViewByAdvisorAssignmentId(String advisorAssignmentId) {
        return finalReportRepository.findViewByAdvisorAssignmentId(advisorAssignmentId)
                .orElseThrow(() -> new AppException("Không tìm thấy dữ liệu hiển thị báo cáo cuối kỳ"));
    }

    private void validateSubmitRequest(MultipartFile file, String advisorAssignmentId) {
        if (!StringUtils.hasText(advisorAssignmentId)) {
            throw new AppException("Thiếu mã phân công giảng viên hướng dẫn");
        }

        if (file == null || file.isEmpty()) {
            throw new AppException("Vui lòng tải file báo cáo");
        }
    }

    /**
     * Validate thời gian nộp final report.
     *
     * Không thêm bảng/cột mới.
     * Dựa vào endDate của InternshipTerm.
     *
     * Công thức:
     * - Ngày mở nộp = endDate - 1 tháng
     * - Ngày khóa nộp = ngày mở nộp + 21 ngày
     */
    private void validateFinalReportTime(AdvisorAssignment assignment) {
        if (assignment.getTerm() == null) {
            throw new AppException("Không tìm thấy kỳ thực tập");
        }

        InternshipTerm term = assignment.getTerm();

        if (term.getEndDate() == null) {
            throw new AppException("Kỳ thực tập chưa có ngày kết thúc");
        }

        if (term.getStatus() == TermStatus.SAP_DIEN_RA) {
            throw new AppException("Kỳ thực tập chưa diễn ra, chưa thể nộp báo cáo cuối kỳ");
        }

        if (term.getStatus() == TermStatus.KET_THUC) {
            throw new AppException("Kỳ thực tập đã kết thúc, không thể nộp báo cáo cuối kỳ");
        }

        LocalDate today = LocalDate.now();

        LocalDate termEndDate = term.getEndDate();

        LocalDate finalReportOpenDate = termEndDate.minusMonths(1);

        LocalDate finalReportDueDate =
                finalReportOpenDate.plusDays(FINAL_REPORT_OPEN_DURATION_DAYS);

        if (today.isBefore(finalReportOpenDate)) {
            throw new AppException(
                    "Chưa đến thời gian nộp báo cáo cuối kỳ. Sinh viên chỉ được nộp từ ngày "
                            + finalReportOpenDate
            );
        }

        if (today.isAfter(finalReportDueDate)) {
            throw new AppException(
                    "Đã quá hạn nộp báo cáo cuối kỳ. Báo cáo đã được chốt để chuẩn bị bảo vệ"
            );
        }
    }
}