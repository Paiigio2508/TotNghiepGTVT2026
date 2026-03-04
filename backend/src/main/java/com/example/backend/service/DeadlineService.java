package com.example.backend.service;

import com.example.backend.dto.request.DeadlineRequest;
import com.example.backend.dto.response.DeadlineProjection;
import com.example.backend.dto.response.TeacherWeeklyReportProjection;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.repository.AdvisorAssignmentRepository;
import com.example.backend.repository.DeadlineRepository;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.util.EmailService;
import com.example.backend.util.status.DeadlineType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeadlineService {

    private final DeadlineRepository deadlineRepository;
    private final InternshipTermRepository internshipTermRepository;
    private final TeacherRepository teacherRepository;
    private  final EmailService emailService;
    private  final AdvisorAssignmentRepository advisorAssignmentRepository;
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
        deadline.setType(DeadlineType.valueOf(request.getType()));

        Deadline savedDeadline = deadlineRepository.save(deadline);

        //  Lấy toàn bộ sinh viên trong kỳ thực tập
        List<AdvisorAssignment> assignments =
                advisorAssignmentRepository.findByTerm_IdAndTeacher_Id(term.getId(),deadline.getTeacher().getId());
        for (AdvisorAssignment assignment : assignments) {

            Student student = assignment.getStudent();
            try {
                emailService.sendDeadlineMail(
                        student.getUser().getEmail(),
                        student.getFullName(),
                        savedDeadline
                );
            } catch (Exception e) {
                System.out.println("Gửi mail thất bại cho: " + student.getUser().getEmail());
            }
        }

        return savedDeadline;
    }
    public Deadline updateDeadline(String id, DeadlineRequest request, String userId) {

        Deadline deadline = deadlineRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy deadline"));

        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên"));

        // đảm bảo teacher chỉ sửa deadline của mình
        if (!deadline.getTeacher().getId().equals(teacher.getId())) {
            throw new AppException("Bạn không có quyền sửa deadline này");
        }

        // convert type
        DeadlineType type;
        try {
            type = DeadlineType.valueOf(request.getType());
        } catch (Exception e) {
            throw new AppException("Loại deadline không hợp lệ");
        }

        // nếu là REPORT thì check tuần
        if (type == DeadlineType.REPORT) {

            if (request.getWeekNo() == null)
                throw new AppException("Deadline báo cáo phải có tuần");

            if (request.getDueDate() == null)
                throw new AppException("Deadline báo cáo phải có hạn nộp");

            int count = deadlineRepository.countByTermAndTeacherAndWeek(
                    request.getInternshipTermId(),
                    teacher.getId(),
                    request.getWeekNo()
            );

            if (count > 0 && !request.getWeekNo().equals(deadline.getWeekNo())) {
                throw new AppException("Tuần này đã có deadline rồi");
            }

            deadline.setWeekNo(request.getWeekNo());
            deadline.setDueDate(request.getDueDate());

        } else {

            // ANNOUNCEMENT
            deadline.setWeekNo(null);
            deadline.setDueDate(null);
        }

        deadline.setTitle(request.getTitle());
        deadline.setDescription(request.getDescription());
        deadline.setType(type);

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