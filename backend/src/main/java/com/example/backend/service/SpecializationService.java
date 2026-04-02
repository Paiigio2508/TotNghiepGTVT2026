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

    @Transactional
    public void updateSpecializations(UpdateTeacherSpecializationRequest request) {

        if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
            throw new AppException("Không tìm thấy giảng viên");
        }

        if (request.getNote() == null || request.getNote().trim().isEmpty()) {
            throw new AppException("Vui lòng nhập lý do thay đổi");
        }

        Teacher teacher = teacherRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên"));

        // lấy danh sách cũ để lưu history
        List<TeacherSpecialization> oldList = teacherSpecializationRepository.findByTeacher(teacher);

        List<String> oldNames = oldList.stream()
                .map(x -> x.getSpecialization().getName())
                .distinct()
                .toList();

        // lấy danh sách id mới, bỏ trùng
        List<String> newIds = request.getSpecializationIds() == null
                ? new ArrayList<>()
                : request.getSpecializationIds().stream()
                .filter(id -> id != null && !id.trim().isEmpty())
                .distinct()
                .toList();

        // lấy specialization mới
        List<Specialization> newSpecs = newIds.isEmpty()
                ? new ArrayList<>()
                : specializationRepository.findByIdIn(newIds);

        List<String> newNames = newSpecs.stream()
                .map(Specialization::getName)
                .distinct()
                .toList();

        // không thay đổi thì thôi
        if (oldNames.size() == newNames.size()
                && oldNames.containsAll(newNames)
                && newNames.containsAll(oldNames)) {
            throw new AppException("Không có thay đổi nào để cập nhật");
        }

        // xóa hết cũ
        teacherSpecializationRepository.deleteByTeacher(teacher);
        teacherSpecializationRepository.flush();

        // thêm mới lại
        List<TeacherSpecialization> newList = newSpecs.stream().map(spec -> {
            TeacherSpecialization ts = new TeacherSpecialization();
            ts.setTeacher(teacher);
            ts.setSpecialization(spec);
            return ts;
        }).toList();

        if (!newList.isEmpty()) {
            teacherSpecializationRepository.saveAll(newList);
        }

        // lưu history bằng tên
        TeacherSpecializationHistory history = new TeacherSpecializationHistory();
        history.setTeacher(teacher);
        history.setOldValue(String.join(", ", oldNames));
        history.setNewValue(String.join(", ", newNames));
        history.setNote(request.getNote().trim());

        teacherSpecializationHistoryRepository.save(history);
    }
    public List<Map<String, Object>> getHistory(String userId) {
        return teacherSpecializationHistoryRepository.getHistory(userId);
    }

}
