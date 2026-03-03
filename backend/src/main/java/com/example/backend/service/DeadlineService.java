package com.example.backend.service;

import com.example.backend.dto.request.DeadlineRequest;
import com.example.backend.dto.response.DeadlineProjection;
import com.example.backend.dto.response.TeacherWeeklyReportProjection;
import com.example.backend.entity.Deadline;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.entity.Teacher;
import com.example.backend.exception.AppException;
import com.example.backend.repository.DeadlineRepository;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeadlineService {

    private final DeadlineRepository deadlineRepository;
    private final InternshipTermRepository internshipTermRepository;
    private final TeacherRepository teacherRepository;
    public List<Deadline> getDeadlinesByTeacher(String termId, String userId) {

        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên"));

        return deadlineRepository.findByTermAndTeacher(termId, teacher.getId());
    }
    public Deadline createDeadline(DeadlineRequest request, String teacherId) {

        InternshipTerm term = internshipTermRepository.findById(request.getInternshipTermId())
                .orElseThrow(() -> new AppException("Không tìm thấy kỳ thực tập"));

        Teacher teacher = teacherRepository.findByUserId(teacherId)
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên"));

        // 🔥 Check trùng tuần bằng native
        int count = deadlineRepository.countByTermAndTeacherAndWeek(
                term.getId(),
                teacher.getId(),
                request.getWeekNo()
        );

        if (count > 0) {
            throw new AppException("Tuần này đã có deadline rồi");
        }

        Deadline deadline = new Deadline();
        deadline.setWeekNo(request.getWeekNo());
        deadline.setTitle(request.getTitle());
        deadline.setDescription(request.getDescription());
        deadline.setDueDate(request.getDueDate());
        deadline.setInternshipTerm(term);
        deadline.setTeacher(teacher);
        return deadlineRepository.save(deadline);
    }
    public Deadline updateDeadline(String id, DeadlineRequest request, String userId) {

        Deadline deadline = deadlineRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy deadline"));

        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên"));

        // 🔥 Đảm bảo giảng viên chỉ sửa deadline của mình
        if (!deadline.getTeacher().getId().equals(teacher.getId())) {
            throw new AppException("Bạn không có quyền sửa deadline này");
        }

        // 🔥 Check trùng tuần (trừ chính nó)
        int count = deadlineRepository.countByTermAndTeacherAndWeek(
                request.getInternshipTermId(),
                teacher.getId(),
                request.getWeekNo()
        );

        if (count > 0 && !deadline.getWeekNo().equals(request.getWeekNo())) {
            throw new AppException("Tuần này đã có deadline rồi");
        }

        deadline.setWeekNo(request.getWeekNo());
        deadline.setTitle(request.getTitle());
        deadline.setDescription(request.getDescription());
        deadline.setDueDate(request.getDueDate());

        return deadlineRepository.save(deadline);
    }
    public List<DeadlineProjection> getDeadlinesForStudent(String userId) {
        return deadlineRepository.findDeadlinesByStudentUserId(userId);
    }
    public DeadlineProjection getDeadlineDetailForStudent(String deadlineId, String userId) {
        return deadlineRepository
                .findDeadlineDetailForStudent(deadlineId, userId)
                .orElseThrow(() -> new AppException("Không tìm thấy deadline"));
    }

    public List<TeacherWeeklyReportProjection> getReportsByWeekAndDeadline(
            String deadlineId,
            String userId
    ) {

        if (deadlineId == null || userId == null) {
            throw new IllegalArgumentException("Thiếu tham số!");
        }

        return deadlineRepository.findReportsByWeekAndDeadline(
                 deadlineId, userId
        );
    }
}