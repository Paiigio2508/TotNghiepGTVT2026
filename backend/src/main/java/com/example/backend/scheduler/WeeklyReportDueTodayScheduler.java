package com.example.backend.scheduler;

import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.Deadline;
import com.example.backend.repository.AdvisorAssignmentRepository;
import com.example.backend.repository.DeadlineRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.WeeklyReportRepository;
import com.example.backend.service.NotificationService;
import com.example.backend.util.status.DeadlineType;
import com.example.backend.util.status.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyReportDueTodayScheduler {

    private final DeadlineRepository deadlineRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    /**
     * Chạy mỗi ngày lúc 08:00 sáng.
     * Chỉ gửi thông báo cho sinh viên chưa nộp báo cáo tuần
     * vào đúng ngày cuối cùng của deadline.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendWeeklyReportDueTodayNotification() {
        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        List<Deadline> deadlines = deadlineRepository.findWeeklyDeadlineDueToday(
                DeadlineType.REPORT,
                startOfDay,
                endOfDay
        );

        for (Deadline deadline : deadlines) {
            String semesterId = deadline.getInternshipTerm().getId();

            List<AdvisorAssignment> assignments =
                    advisorAssignmentRepository.findByTerm_Id(semesterId);

            for (AdvisorAssignment assignment : assignments) {
                boolean submitted = weeklyReportRepository
                        .existsByAdvisorAssignmentAndDeadline(assignment, deadline);

                if (submitted) {
                    continue;
                }

                String studentId = assignment.getStudent().getId();

                String entityId = "WEEKLY_DUE_TODAY_"
                        + deadline.getId()
                        + "_"
                        + assignment.getId();

                boolean alreadyNotified = notificationRepository
                        .existsByUser_IdAndTypeAndEntityId(
                                studentId,
                                NotificationType.WEEKLY_REPORT_DUE_SOON,
                                entityId
                        );

                if (alreadyNotified) {
                    continue;
                }

                notificationService.createWeeklyDueSoonNotification(
                        assignment.getStudent().getUser(),
                        deadline.getTitle(),
                        entityId
                );
            }
        }
    }
}