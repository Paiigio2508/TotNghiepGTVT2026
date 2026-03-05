package com.example.backend.repository;

import com.example.backend.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreRepository extends JpaRepository<Score,String> {
}
