package com.example.backend.service;

import com.example.backend.dto.request.SaveTeacherSpecializationTermRequest;
import com.example.backend.dto.request.TeacherSpecializationTermResponse;
import com.example.backend.dto.response.TeacherSpecializationHistoryResponse;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.entity.Specialization;
import com.example.backend.entity.Teacher;
import com.example.backend.entity.TeacherSpecializationHistory;
import com.example.backend.entity.TeacherSpecializationTerm;
import com.example.backend.exception.AppException;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.repository.SpecializationRepository;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.repository.TeacherSpecializationHistoryRepository;
import com.example.backend.repository.TeacherSpecializationTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherSpecializationTermService {

    private final TeacherRepository teacherRepository;
    private final SpecializationRepository specializationRepository;
    private final InternshipTermRepository internshipTermRepository;
    private final TeacherSpecializationTermRepository teacherSpecializationTermRepository;
    private final TeacherSpecializationHistoryRepository teacherSpecializationHistoryRepository;


    public List<TeacherSpecializationHistoryResponse> getHistoryByTerm(String termId) {
        return teacherSpecializationHistoryRepository.findHistoryByTermId(termId);
    }
    public List<TeacherSpecializationTermResponse> getTeacherSpecializationTerm(String termId) {
        List<Teacher> teachers = teacherRepository.findAll();
        List<TeacherSpecializationTerm> assignments = teacherSpecializationTermRepository.findByTerm_Id(termId);

        Map<String, List<TeacherSpecializationTerm>> grouped = assignments.stream()
                .collect(Collectors.groupingBy(item -> item.getTeacher().getId()));

        return teachers.stream().map(teacher -> {
            List<TeacherSpecializationTermResponse.SpecializationItem> specializationItems =
                    grouped.getOrDefault(teacher.getId(), Collections.emptyList())
                            .stream()
                            .map(item -> new TeacherSpecializationTermResponse.SpecializationItem(
                                    item.getSpecialization().getId(),
                                    item.getSpecialization().getName()
                            ))
                            .collect(Collectors.toList());

            String email = "";
            String role = "";

            if (teacher.getUser() != null) {
                email = teacher.getUser().getEmail() != null ? teacher.getUser().getEmail() : "";
                role = teacher.getUser().getRole() != null ? teacher.getUser().getRole().toString() : "";
            }

            return new TeacherSpecializationTermResponse(
                    teacher.getId(),
                    teacher.getTeacherCode(),
                    teacher.getFullName(),
                    email,
                    role,
                    specializationItems
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void saveTeacherSpecializationTerm(SaveTeacherSpecializationTermRequest request) {
        InternshipTerm term = internshipTermRepository.findById(request.getTermId())
                .orElseThrow(() -> new AppException("Không tìm thấy kỳ thực tập"));

        validateEditableTerm(term);

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên"));

        List<TeacherSpecializationTerm> oldAssignments =
                teacherSpecializationTermRepository.findByTeacher_IdAndTerm_Id(teacher.getId(), term.getId());

        String oldValue = oldAssignments.stream()
                .map(item -> item.getSpecialization().getName())
                .sorted()
                .collect(Collectors.joining(", "));

        List<Specialization> newSpecializations = request.getSpecializationIds() == null
                ? new ArrayList<>()
                : specializationRepository.findAllById(request.getSpecializationIds());

        String newValue = newSpecializations.stream()
                .map(Specialization::getName)
                .sorted()
                .collect(Collectors.joining(", "));

        if (!oldValue.equals(newValue)) {
            TeacherSpecializationHistory history = new TeacherSpecializationHistory();
            history.setTeacher(teacher);
            history.setTerm(term);
            history.setOldValue(oldValue);
            history.setNewValue(newValue);
            history.setNote("Cập nhật phân công chuyên môn theo kỳ");
            teacherSpecializationHistoryRepository.save(history);
        }

        teacherSpecializationTermRepository.deleteByTeacher_IdAndTerm_Id(teacher.getId(), term.getId());
        teacherSpecializationTermRepository.flush();

        if (newSpecializations.isEmpty()) {
            return;
        }

        List<TeacherSpecializationTerm> entities = new ArrayList<>();
        for (Specialization specialization : newSpecializations) {
            TeacherSpecializationTerm entity = new TeacherSpecializationTerm();
            entity.setTeacher(teacher);
            entity.setTerm(term);
            entity.setSpecialization(specialization);
            entities.add(entity);
        }

        teacherSpecializationTermRepository.saveAll(entities);
        teacherSpecializationTermRepository.flush();
    }

    @Transactional
    public void saveTeacherSpecializationTermBulk(List<SaveTeacherSpecializationTermRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return;
        }

        String termId = requests.get(0).getTermId();

        InternshipTerm term = internshipTermRepository.findById(termId)
                .orElseThrow(() -> new AppException("Không tìm thấy kỳ thực tập"));

        validateEditableTerm(term);

        for (SaveTeacherSpecializationTermRequest request : requests) {
            saveTeacherSpecializationTerm(request);
        }
    }

    private void validateEditableTerm(InternshipTerm term) {
        String status = term.getStatus() == null ? "" : term.getStatus().name().trim().toUpperCase();

        if (!status.equals("DANG_DIEN_RA")) {
            throw new AppException("Chỉ được lưu khi kỳ thực tập đang diễn ra");
        }
    }
}