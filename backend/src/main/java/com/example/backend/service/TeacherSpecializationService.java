package com.example.backend.service;

import com.example.backend.dto.response.SpecializationResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Teacher;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.repository.TeacherSpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeacherSpecializationService {

    private final TeacherSpecializationRepository teacherSpecializationRepository;
    private final TeacherRepository teacherRepository;

    public List<SpecializationResponse> getCurrentSpecializations(String userId) {
        Optional<Teacher> teacher = teacherRepository.findByUserId(userId);
        return teacherSpecializationRepository.findSpecializationsRaw(teacher.get().getId());
    }
}
