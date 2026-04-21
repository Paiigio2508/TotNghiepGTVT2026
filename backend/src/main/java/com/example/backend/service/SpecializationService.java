package com.example.backend.service;

import com.example.backend.dto.request.UpdateTeacherSpecializationRequest;
import com.example.backend.entity.Specialization;
import com.example.backend.entity.Teacher;
import com.example.backend.entity.TeacherSpecialization;
import com.example.backend.entity.TeacherSpecializationHistory;
import com.example.backend.exception.AppException;
import com.example.backend.repository.SpecializationRepository;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.repository.TeacherSpecializationHistoryRepository;
import com.example.backend.repository.TeacherSpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SpecializationService {
    private final SpecializationRepository specializationRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherSpecializationRepository teacherSpecializationRepository;
    private final TeacherSpecializationHistoryRepository teacherSpecializationHistoryRepository;

    public List<Specialization> getAll() {
        return specializationRepository.findAll();
    }

    public Specialization create(Specialization specialization) {

        String name = specialization.getName().trim().toLowerCase();

        if (name.isEmpty()) {
            throw new AppException("Tên không được để trống");
        }

        if (specializationRepository.existsByName(name)) {
            throw new AppException("Tên chuyên ngành đã tồn tại");
        }

        specialization.setName(name);

        if (specialization.getStatus() == null) {
            specialization.setStatus(0); // nên để 1 = hoạt động
        }

        return specializationRepository.save(specialization);
    }

    public Specialization update(String id, Specialization data) {

        Specialization sp = specializationRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy"));

        String name = data.getName().trim().toLowerCase();

        if (name.isEmpty()) {
            throw new AppException("Tên không được để trống");
        }

        if (specializationRepository.existsByNameAndIdNot(name, id)) {
            throw new AppException("Tên chuyên ngành đã tồn tại");
        }

        sp.setName(name);
        sp.setDescription(data.getDescription());

        return specializationRepository.save(sp);
    }

    public Specialization deleteSpecialization(String id) {

        Specialization specialization = specializationRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy"));

        specialization.setStatus(specialization.getStatus() == 1 ? 0 : 1);

        specialization.setUpdatedAt(LocalDateTime.now());

        return specializationRepository.save(specialization);
    }
    public List<Map<String, Object>> getHistory(String userId) {
        return teacherSpecializationHistoryRepository.getHistory(userId);
    }

}
