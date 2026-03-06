package com.example.backend.repository;

import com.example.backend.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score,String> {
    Optional<Score> findByWeeklyReportId(String weeklyReportId);
}
