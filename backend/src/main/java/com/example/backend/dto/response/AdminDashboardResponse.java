package com.example.backend.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private TermDto term;
    private OverviewDto overview;
    private FinalReportDto finalReport;
    private List<TopicStatusDto> topicStatus;
    private List<WeeklyDeadlineDto> weeklyDeadlines;
    private List<TeacherStatDto> teacherStats;
    private List<WarningDto> warnings;
    private List<RecentFinalReportDto> recentFinalReports;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TermDto {
        private String id;
        private String name;
        private String academicYear;
        private String startDate;
        private String endDate;
        private String status;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewDto {
        private Long students;
        private Long teachers;
        private Long topics;
        private Long approvedTopics;
        private Long finalSubmitted;
        private Long finalGraded;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinalReportDto {
        private Long expected;
        private Long submitted;
        private Long notSubmitted;
        private Long graded;
        private Long waitingGrade;
        private Double avgScore;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicStatusDto {
        private String label;
        private Long value;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyDeadlineDto {
        private String id;
        private String teacherCode;
        private String teacherName;
        private Integer weekNo;
        private String title;
        private String dueDate;
        private Long expected;
        private Long submitted;
        private Long notSubmitted;
        private Long late;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherStatDto {
        private String teacherId;
        private String teacherCode;
        private String teacherName;
        private Long students;
        private Long approvedTopics;
        private Long finalSubmitted;
        private Long finalGraded;
        private Double avgFinalScore;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarningDto {
        private String title;
        private Long value;
        private String type;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentFinalReportDto {
        private String studentCode;
        private String studentName;
        private String teacherName;
        private String topicTitle;
        private String submitDate;
        private String status;
        private String statusType;
        private Double score;
    }
}