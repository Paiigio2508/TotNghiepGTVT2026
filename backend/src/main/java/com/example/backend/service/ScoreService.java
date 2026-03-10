package com.example.backend.service;

import com.example.backend.dto.request.ScoreRequest;
import com.example.backend.dto.response.ScoreForStudentView;
import com.example.backend.dto.response.ScoreStudentTeacherView;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.repository.ScoreRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.repository.WeeklyReportRepository;
import com.example.backend.util.status.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScoreService {
    private final ScoreRepository scoreRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private  final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private  final NotificationService notificationService;
    public Score createScore(ScoreRequest scoreRequest) {

        WeeklyReport weeklyReport = weeklyReportRepository
                .findById(scoreRequest.getWeeklyReportId())
                .orElseThrow(() -> new RuntimeException("Weekly report not found"));

        Optional<Score> existingScore =
                scoreRepository.findByWeeklyReportId(scoreRequest.getWeeklyReportId());

        Score score;

        if (existingScore.isPresent()) {
            score = existingScore.get();
            score.setScore(scoreRequest.getScore());
            score.setNote(scoreRequest.getNote());
            score.setUpdatedAt(LocalDateTime.now());
        } else {
            score = new Score();
            score.setWeeklyReport(weeklyReport);
            score.setScore(scoreRequest.getScore());
            score.setNote(scoreRequest.getNote());
            score.setCreatedAt(LocalDateTime.now());
        }

        /* SAVE SCORE TRƯỚC */
        Score savedScore = scoreRepository.save(score);

        Student student = weeklyReport.getAdvisorAssignment().getStudent();

        Notification notification = new Notification();
        notification.setTitle("Đã có điểm báo cáo tuần");
        notification.setContent(
                "Tuần " + weeklyReport.getWeekNo() +
                        " đã được chấm điểm: " + savedScore.getScore()
        );
        notification.setUser(student.getUser());
        notification.setType(NotificationType.WEEKLY_REPORT_GRADED);
        notification.setEntityId(savedScore.getId());
        notificationService.sendNotification(notification);

        return savedScore;
    }
   public List<ScoreForStudentView> getALLScoreByStudent(String userID){
        Student student = studentRepository
                .findByUser_Id(userID)
                .orElseThrow(() -> new AppException("Student not found"));
        return scoreRepository.getALLScoreByStudent(student.getId());
    }
    public List<ScoreStudentTeacherView> getALLScoreStudentByTeacher(String userID, String termID){

        // Admin không chọn teacher → chỉ lọc theo term
        if(userID == null || userID.equals("null") || userID.isBlank()){
            return scoreRepository.getALLScoreStudentByTeacher(null, termID);
        }

        // Có chọn teacher → tìm teacher theo userId
        Teacher teacher = teacherRepository
                .findByUserId(userID)
                .orElseThrow(() -> new AppException("Teacher not found"));

        return scoreRepository.getALLScoreStudentByTeacher(teacher.getId(), termID);
    }
}
