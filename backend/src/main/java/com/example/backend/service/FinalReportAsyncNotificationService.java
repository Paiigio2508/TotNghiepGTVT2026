package com.example.backend.service;

import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.FinalReport;
import com.example.backend.entity.Notification;
import com.example.backend.entity.Student;
import com.example.backend.exception.AppException;
import com.example.backend.repository.FinalReportRepository;
import com.example.backend.util.status.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class FinalReportAsyncNotificationService {

    private final FinalReportRepository finalReportRepository;
    private final NotificationService notificationService;
    private final JavaMailSender mailSender;

    @Async
    @Transactional(readOnly = true)
    public void sendRevisionNotificationAndMail(String finalReportId, String comment) {
        try {
            FinalReport finalReport = getFinalReportEntity(finalReportId);
            AdvisorAssignment assignment = finalReport.getAdvisorAssignment();
            Student student = getStudentFromAssignment(assignment);

            String topicTitle = getTopicTitle(assignment);

            sendSystemNotification(
                    student,
                    "Báo cáo cuối kỳ cần chỉnh sửa",
                    "Báo cáo cuối kỳ của bạn cần chỉnh sửa. Nhận xét: " + comment,
                    NotificationType.FINAL_REPORT_NEED_REVISION,
                    finalReport.getId()
            );

            sendMailIfHasEmail(
                    student,
                    "Yêu cầu chỉnh sửa báo cáo cuối kỳ",
                    """
                    Xin chào %s,

                    Giảng viên hướng dẫn đã xem báo cáo cuối kỳ của bạn và yêu cầu chỉnh sửa.

                    Thông tin báo cáo:
                    - Đề tài: %s
                    - Nhận xét của giảng viên: %s

                    Vui lòng đăng nhập hệ thống để chỉnh sửa và nộp lại báo cáo cuối kỳ.

                    Trân trọng.
                    """.formatted(
                            student.getFullName(),
                            topicTitle,
                            comment
                    )
            );

        } catch (Exception e) {
            System.out.println("ASYNC - Không gửi được thông báo/mail yêu cầu sửa final report: " + e.getMessage());
        }
    }

    @Async
    @Transactional(readOnly = true)
    public void sendApprovalNotificationAndMail(
            String finalReportId,
            String notificationTitle,
            String notificationContent,
            String emailSubject,
            String emailTemplate,
            NotificationType notificationType
    ) {
        try {
            FinalReport finalReport = getFinalReportEntity(finalReportId);
            AdvisorAssignment assignment = finalReport.getAdvisorAssignment();
            Student student = getStudentFromAssignment(assignment);

            String topicTitle = getTopicTitle(assignment);

            sendSystemNotification(
                    student,
                    notificationTitle,
                    notificationContent,
                    notificationType,
                    finalReport.getId()
            );

            sendMailIfHasEmail(
                    student,
                    emailSubject,
                    emailTemplate.formatted(
                            student.getFullName(),
                            topicTitle
                    )
            );

        } catch (Exception e) {
            System.out.println("ASYNC - Không gửi được thông báo/mail duyệt final report: " + e.getMessage());
        }
    }

    @Async
    @Transactional(readOnly = true)
    public void sendGradeNotificationAndMail(String finalReportId, Double score) {
        try {
            FinalReport finalReport = getFinalReportEntity(finalReportId);
            AdvisorAssignment assignment = finalReport.getAdvisorAssignment();
            Student student = getStudentFromAssignment(assignment);

            String topicTitle = getTopicTitle(assignment);

            sendSystemNotification(
                    student,
                    "Báo cáo cuối kỳ đã được chấm điểm",
                    "Báo cáo cuối kỳ của bạn đã được chấm điểm: " + score + "/10",
                    NotificationType.FINAL_REPORT_GRADED,
                    finalReport.getId()
            );

            sendMailIfHasEmail(
                    student,
                    "Báo cáo cuối kỳ đã được chấm điểm",
                    """
                    Xin chào %s,

                    Báo cáo cuối kỳ của bạn đã được chấm điểm.

                    Thông tin báo cáo:
                    - Đề tài: %s
                    - Điểm: %s/10

                    Vui lòng đăng nhập hệ thống để xem chi tiết.

                    Trân trọng.
                    """.formatted(
                            student.getFullName(),
                            topicTitle,
                            score
                    )
            );

        } catch (Exception e) {
            System.out.println("ASYNC - Không gửi được thông báo/mail chấm điểm final report: " + e.getMessage());
        }
    }

    private FinalReport getFinalReportEntity(String id) {
        return finalReportRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy báo cáo cuối kỳ"));
    }

    private Student getStudentFromAssignment(AdvisorAssignment assignment) {
        if (assignment == null || assignment.getStudent() == null) {
            throw new AppException("Không tìm thấy sinh viên của báo cáo cuối kỳ");
        }

        Student student = assignment.getStudent();

        if (student.getUser() == null) {
            throw new AppException("Sinh viên chưa có tài khoản người dùng");
        }

        return student;
    }

    private String getTopicTitle(AdvisorAssignment assignment) {
        if (assignment != null && assignment.getTopic() != null) {
            return assignment.getTopic().getTitle();
        }

        return "Báo cáo cuối kỳ";
    }

    private void sendSystemNotification(
            Student student,
            String title,
            String content,
            NotificationType type,
            String entityId
    ) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setContent(content);
        notification.setUser(student.getUser());
        notification.setType(type);
        notification.setEntityId(entityId);

        notificationService.sendNotification(notification);
    }

    private void sendMailIfHasEmail(
            Student student,
            String subject,
            String content
    ) {
        if (!StringUtils.hasText(student.getUser().getEmail())) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(student.getUser().getEmail());
        message.setSubject(subject);
        message.setText(content);

        mailSender.send(message);
    }
}