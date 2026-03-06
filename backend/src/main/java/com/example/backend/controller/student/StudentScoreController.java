package com.example.backend.controller.student;

import com.example.backend.dto.response.ScoreForStudentView;
import com.example.backend.service.ScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/scores")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class StudentScoreController {
    private final ScoreService scoreService;

    @GetMapping("/{userId}")
    public List<ScoreForStudentView> getByUser(@PathVariable String userId) {
        return scoreService.getALLScoreByStudent(userId);
    }
}
