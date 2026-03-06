package com.example.backend.service;

import com.example.backend.dto.request.ScoreRequest;
import com.example.backend.entity.Score;
import com.example.backend.entity.WeeklyReport;
import com.example.backend.repository.ScoreRepository;
import com.example.backend.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScoreService {
    private final ScoreRepository scoreRepository;
    private final WeeklyReportRepository weeklyReportRepository;

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

        return scoreRepository.save(score);
    }
}
