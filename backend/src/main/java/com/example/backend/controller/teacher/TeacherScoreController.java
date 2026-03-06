package com.example.backend.controller.teacher;

import com.example.backend.dto.request.ScoreRequest;
import com.example.backend.dto.response.ScoreStudentTeacherView;
import com.example.backend.service.ScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/teacher/scores")
@CrossOrigin("http://localhost:5173")
public class TeacherScoreController {

    private final ScoreService scoreService;

    @PostMapping
    public ResponseEntity<?> createScore(@RequestBody ScoreRequest score) {
        scoreService.createScore(score);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/{userId}/{termId}")
    public List<ScoreStudentTeacherView> getByUser(@PathVariable String userId, @PathVariable String termId) {
        return scoreService.getALLScoreStudentByTeacher(userId, termId);
    }
}
