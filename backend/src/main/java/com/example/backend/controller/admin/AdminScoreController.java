package com.example.backend.controller.admin;

import com.example.backend.dto.response.ScoreStudentTeacherView;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ScoreService;
import com.example.backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/scores")
@CrossOrigin("http://localhost:5173")
public class AdminScoreController {

    private final ScoreService scoreService;
    @GetMapping("/{userId}/{termId}")
    public List<ScoreStudentTeacherView> getByUser(@PathVariable String userId, @PathVariable String termId) {

        return scoreService.getALLScoreStudentByTeacher(userId, termId);
    }
}
