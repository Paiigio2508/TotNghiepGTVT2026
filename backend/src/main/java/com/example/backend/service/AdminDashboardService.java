package com.example.backend.service;


import com.example.backend.dto.response.AdminDashboardResponse;
import com.example.backend.entity.Deadline;
import com.example.backend.entity.FinalReport;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.repository.AdminDashboardQueryRepository;
import com.example.backend.repository.InternshipTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final InternshipTermRepository internshipTermRepository;
    private final AdminDashboardQueryRepository dashboardQueryRepository;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public AdminDashboardResponse getDashboard(String termId) {
        InternshipTerm term = internshipTermRepository.findById(termId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỳ thực tập"));

        Long students = dashboardQueryRepository.countStudentsByTerm(termId);
        Long teachers = dashboardQueryRepository.countTeachersByTerm(termId);
        Long topics = dashboardQueryRepository.countTopicsByTerm(termId);

        Long finalSubmitted = dashboardQueryRepository.countFinalSubmittedByTerm(termId);
        Long finalGraded = dashboardQueryRepository.countFinalGradedByTerm(termId);
        Double avgFinalScore = dashboardQueryRepository.avgFinalScoreByTerm(termId);

        List<AdminDashboardResponse.TopicStatusDto> topicStatus = getTopicStatus(termId);

        Long approvedTopics = topicStatus.stream()
                .filter(item -> "Đã duyệt".equals(item.getLabel()))
                .mapToLong(AdminDashboardResponse.TopicStatusDto::getValue)
                .sum();

        Long waitingAdminTopic = topicStatus.stream()
                .filter(item -> "Chờ admin duyệt".equals(item.getLabel()))
                .mapToLong(AdminDashboardResponse.TopicStatusDto::getValue)
                .sum();

        Long notSubmittedFinal = Math.max(students - finalSubmitted, 0);
        Long waitingFinalGrade = Math.max(finalSubmitted - finalGraded, 0);

        return AdminDashboardResponse.builder()
                .term(AdminDashboardResponse.TermDto.builder()
                        .id(term.getId())
                        .name(term.getName())
                        .academicYear(term.getAcademicYear())
                        .startDate(formatDate(term.getStartDate()))
                        .endDate(formatDate(term.getEndDate()))
                        .status(formatTermStatus(term.getStatus()))
                        .build())

                .overview(AdminDashboardResponse.OverviewDto.builder()
                        .students(students)
                        .teachers(teachers)
                        .topics(topics)
                        .approvedTopics(approvedTopics)
                        .finalSubmitted(finalSubmitted)
                        .finalGraded(finalGraded)
                        .build())

                .finalReport(AdminDashboardResponse.FinalReportDto.builder()
                        .expected(students)
                        .submitted(finalSubmitted)
                        .notSubmitted(notSubmittedFinal)
                        .graded(finalGraded)
                        .waitingGrade(waitingFinalGrade)
                        .avgScore(round1(avgFinalScore))
                        .build())

                .topicStatus(topicStatus)
                .weeklyDeadlines(getWeeklyDeadlineStats(termId))
                .teacherStats(getTeacherStats(termId))

                .warnings(List.of(
                        AdminDashboardResponse.WarningDto.builder()
                                .title("Báo cáo cuối kỳ chưa nộp")
                                .value(notSubmittedFinal)
                                .type("danger")
                                .build(),
                        AdminDashboardResponse.WarningDto.builder()
                                .title("Đề tài chờ admin duyệt")
                                .value(waitingAdminTopic)
                                .type("warning")
                                .build(),
                        AdminDashboardResponse.WarningDto.builder()
                                .title("Báo cáo cuối kỳ chờ chấm")
                                .value(waitingFinalGrade)
                                .type("info")
                                .build()
                ))

                .recentFinalReports(getRecentFinalReports(termId))
                .build();
    }

    private List<AdminDashboardResponse.TopicStatusDto> getTopicStatus(String termId) {
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("Chờ giảng viên duyệt", 0L);
        result.put("Chờ admin duyệt", 0L);
        result.put("Đã duyệt", 0L);
        result.put("Từ chối", 0L);

        List<AdminDashboardQueryRepository.TopicStatusCount> rows =
                dashboardQueryRepository.countTopicStatusByTerm(termId);

        for (AdminDashboardQueryRepository.TopicStatusCount row : rows) {
            String label = formatTopicStatus(row.status());
            result.put(label, result.getOrDefault(label, 0L) + row.total());
        }

        return result.entrySet()
                .stream()
                .map(entry -> AdminDashboardResponse.TopicStatusDto.builder()
                        .label(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .toList();
    }

    private List<AdminDashboardResponse.WeeklyDeadlineDto> getWeeklyDeadlineStats(String termId) {
        List<Deadline> deadlines = dashboardQueryRepository.findDeadlinesByTerm(termId);
        List<AdminDashboardResponse.WeeklyDeadlineDto> result = new ArrayList<>();

        for (Deadline deadline : deadlines) {
            if (!isWeeklyReportDeadline(deadline)) {
                continue;
            }

            if (deadline.getTeacher() == null) {
                continue;
            }

            String teacherId = deadline.getTeacher().getId();

            Long expected = dashboardQueryRepository.countStudentsByTermAndTeacher(termId, teacherId);
            Long submitted = dashboardQueryRepository.countWeeklySubmittedByDeadline(deadline.getId());
            Long late = dashboardQueryRepository.countWeeklyLateByDeadline(deadline.getId());

            result.add(AdminDashboardResponse.WeeklyDeadlineDto.builder()
                    .id(deadline.getId())
                    .teacherCode(deadline.getTeacher().getTeacherCode())
                    .teacherName(deadline.getTeacher().getFullName())
                    .weekNo(deadline.getWeekNo())
                    .title(deadline.getTitle())
                    .dueDate(deadline.getDueDate() == null
                            ? ""
                            : deadline.getDueDate().format(DATE_TIME_FORMATTER))
                    .expected(expected)
                    .submitted(submitted)
                    .notSubmitted(Math.max(expected - submitted, 0))
                    .late(late)
                    .build());
        }

        return result;
    }

    private List<AdminDashboardResponse.TeacherStatDto> getTeacherStats(String termId) {
        List<AdminDashboardQueryRepository.TeacherBaseStat> rows =
                dashboardQueryRepository.findTeacherBaseStatsByTerm(termId);

        List<AdminDashboardResponse.TeacherStatDto> result = new ArrayList<>();

        for (AdminDashboardQueryRepository.TeacherBaseStat row : rows) {
            Long approvedTopics = getApprovedTopicCountByTeacher(termId, row.teacherId());

            Long finalSubmitted = dashboardQueryRepository
                    .countFinalSubmittedByTermAndTeacher(termId, row.teacherId());

            Long finalGraded = dashboardQueryRepository
                    .countFinalGradedByTermAndTeacher(termId, row.teacherId());

            Double avgScore = dashboardQueryRepository
                    .avgFinalScoreByTermAndTeacher(termId, row.teacherId());

            result.add(AdminDashboardResponse.TeacherStatDto.builder()
                    .teacherId(row.teacherId())
                    .teacherCode(row.teacherCode())
                    .teacherName(row.teacherName())
                    .students(row.students())
                    .approvedTopics(approvedTopics)
                    .finalSubmitted(finalSubmitted)
                    .finalGraded(finalGraded)
                    .avgFinalScore(round1(avgScore))
                    .build());
        }

        return result;
    }

    private Long getApprovedTopicCountByTeacher(String termId, String teacherId) {
        List<AdminDashboardQueryRepository.TopicStatusCount> rows =
                dashboardQueryRepository.countTopicStatusByTermAndTeacher(termId, teacherId);

        long total = 0L;

        for (AdminDashboardQueryRepository.TopicStatusCount row : rows) {
            if (isFinalApprovedTopicStatus(row.status())) {
                total += row.total();
            }
        }

        return total;
    }

    private List<AdminDashboardResponse.RecentFinalReportDto> getRecentFinalReports(String termId) {
        List<FinalReport> reports = dashboardQueryRepository.findRecentFinalReportsByTerm(termId, 8);

        return reports.stream()
                .map(report -> {
                    var assignment = report.getAdvisorAssignment();

                    return AdminDashboardResponse.RecentFinalReportDto.builder()
                            .studentCode(assignment.getStudent().getStudentCode())
                            .studentName(assignment.getStudent().getFullName())
                            .teacherName(assignment.getTeacher().getFullName())
                            .topicTitle(assignment.getTopic() == null
                                    ? "Chưa có đề tài"
                                    : assignment.getTopic().getTitle())
                            .submitDate(report.getSubmitDate() == null
                                    ? ""
                                    : report.getSubmitDate().format(DATE_TIME_FORMATTER))
                            .status(formatFinalReportStatus(report))
                            .statusType(formatFinalReportStatusType(report))
                            .score(report.getScore())
                            .build();
                })
                .toList();
    }

    private boolean isWeeklyReportDeadline(Deadline deadline) {
        if (deadline == null || deadline.getType() == null) {
            return false;
        }

        String type = deadline.getType().toString().toUpperCase();

        return type.contains("WEEKLY")
                || type.contains("BAO_CAO_TUAN")
                || type.contains("REPORT");
    }

    private String formatDate(LocalDate date) {
        return date == null ? "" : date.format(DATE_FORMATTER);
    }

    private Double round1(Double value) {
        if (value == null) return null;
        return Math.round(value * 10.0) / 10.0;
    }

    private String formatTermStatus(Object status) {
        if (status == null) return "Không xác định";

        String value = status.toString().toUpperCase();

        if (value.contains("ACTIVE")
                || value.contains("IN_PROGRESS")
                || value.contains("DANG_DIEN_RA")) {
            return "Đang diễn ra";
        }

        if (value.contains("FINISH")
                || value.contains("DONE")
                || value.contains("COMPLETED")
                || value.contains("ENDED")
                || value.contains("KET_THUC")) {
            return "Đã kết thúc";
        }

        if (value.contains("UPCOMING")
                || value.contains("SAP_DIEN_RA")) {
            return "Sắp diễn ra";
        }

        return status.toString();
    }

    private String formatTopicStatus(String status) {
        String value = status == null ? "" : status.toUpperCase();

        if (value.contains("REJECT") || value.contains("TU_CHOI")) {
            return "Từ chối";
        }

        if (isFinalApprovedTopicStatus(value)) {
            return "Đã duyệt";
        }

        if (value.contains("APPROVED_BY_TEACHER")
                || value.contains("TEACHER_APPROVED")
                || value.contains("WAITING_ADMIN")
                || value.contains("PENDING_ADMIN")) {
            return "Chờ admin duyệt";
        }

        return "Chờ giảng viên duyệt";
    }

    private boolean isFinalApprovedTopicStatus(String status) {
        String value = status == null ? "" : status.toUpperCase();

        return value.contains("APPROVED_BY_ADMIN")
                || value.contains("ADMIN_APPROVED")
                || value.equals("APPROVED")
                || value.contains("DA_DUYET_ADMIN");
    }

    private String formatFinalReportStatus(FinalReport report) {
        if (report.getScore() != null) {
            return "Đã chấm";
        }

        if (report.getStatus() == null) {
            return "Chờ chấm";
        }

        String value = report.getStatus().toString().toUpperCase();

        if (value.contains("REJECT")) {
            return "Từ chối";
        }

        if (value.contains("REVISION")
                || value.contains("REQUEST")
                || value.contains("EDIT")) {
            return "Cần chỉnh sửa";
        }

        return "Chờ chấm";
    }

    private String formatFinalReportStatusType(FinalReport report) {
        if (report.getScore() != null) {
            return "done";
        }

        if (report.getStatus() == null) {
            return "pending";
        }

        String value = report.getStatus().toString().toUpperCase();

        if (value.contains("REJECT")) {
            return "danger";
        }

        if (value.contains("REVISION")
                || value.contains("REQUEST")
                || value.contains("EDIT")) {
            return "review";
        }

        return "pending";
    }
}