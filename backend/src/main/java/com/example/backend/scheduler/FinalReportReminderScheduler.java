package com.example.backend.scheduler;

import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.repository.AdvisorAssignmentRepository;
import com.example.backend.repository.FinalReportRepository;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.util.status.TermStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FinalReportReminderScheduler {

    private static final long FINAL_REPORT_OPEN_DURATION_DAYS = 21;

    private final InternshipTermRepository internshipTermRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;
    private final FinalReportRepository finalReportRepository;
    private final JavaMailSender mailSender;

    /**
     * Chạy mỗi ngày lúc 08:00 sáng.
     */
    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
    public void sendFinalReportReminderMail() {
        LocalDate today = LocalDate.now();

        List<InternshipTerm> terms =
                internshipTermRepository.findByStatus(TermStatus.DANG_DIEN_RA);

        for (InternshipTerm term : terms) {
            if (term.getEndDate() == null) {
                continue;
            }

            LocalDate openDate = term.getEndDate().minusMonths(1);
            LocalDate dueDate = openDate.plusDays(FINAL_REPORT_OPEN_DURATION_DAYS);
            LocalDate remindBeforeDueDate = dueDate.minusDays(3);

            boolean isOpenDate = today.isEqual(openDate);
            boolean isRemindBeforeDueDate = today.isEqual(remindBeforeDueDate);

            if (!isOpenDate && !isRemindBeforeDueDate) {
                continue;
            }

            List<AdvisorAssignment> assignments =
                    advisorAssignmentRepository.findByTerm_Id(term.getId());

            for (AdvisorAssignment assignment : assignments) {
                boolean submitted =
                        finalReportRepository.existsByAdvisorAssignment_Id(assignment.getId());

                if (submitted) {
                    continue;
                }

                if (assignment.getStudent() == null
                        || assignment.getStudent().getUser() == null
                        || assignment.getStudent().getUser().getEmail() == null) {
                    continue;
                }

                String email = assignment.getStudent().getUser().getEmail();

                if (isOpenDate) {
                    sendOpenReminderMail(email, assignment, term, openDate, dueDate);
                }

                if (isRemindBeforeDueDate) {
                    sendBeforeDueReminderMail(email, assignment, term, dueDate);
                }
            }
        }
    }

    private void sendOpenReminderMail(
            String email,
            AdvisorAssignment assignment,
            InternshipTerm term,
            LocalDate openDate,
            LocalDate dueDate
    ) {
        String subject = "Thông báo mở nộp báo cáo cuối kỳ";

        String content = """
                Xin chào %s,

                Hệ thống thông báo chức năng nộp báo cáo cuối kỳ đã được mở.

                Thông tin kỳ thực tập:
                - Kỳ thực tập: %s
                - Năm học: %s
                - Ngày bắt đầu nộp: %s
                - Hạn cuối nộp: %s

                Sinh viên vui lòng đăng nhập hệ thống để nộp báo cáo cuối kỳ đúng hạn.

                Trân trọng.
                """.formatted(
                assignment.getStudent().getFullName(),
                term.getName(),
                term.getAcademicYear(),
                openDate,
                dueDate
        );

        sendMail(email, subject, content);
    }

    private void sendBeforeDueReminderMail(
            String email,
            AdvisorAssignment assignment,
            InternshipTerm term,
            LocalDate dueDate
    ) {
        String subject = "Nhắc nhở nộp báo cáo cuối kỳ";

        String content = """
                Xin chào %s,

                Hệ thống ghi nhận sinh viên chưa nộp báo cáo cuối kỳ.

                Thông tin kỳ thực tập:
                - Kỳ thực tập: %s
                - Năm học: %s
                - Hạn cuối nộp: %s

                Sinh viên vui lòng hoàn thành việc nộp báo cáo cuối kỳ trước hạn để giảng viên hướng dẫn xét duyệt.

                Trân trọng.
                """.formatted(
                assignment.getStudent().getFullName(),
                term.getName(),
                term.getAcademicYear(),
                dueDate
        );

        sendMail(email, subject, content);
    }

    private void sendMail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);

        mailSender.send(message);
    }
}