package com.example.backend.service;

import com.example.backend.dto.response.InternshipTermResponse;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.entity.Student;
import com.example.backend.exception.AppException;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.util.EmailService;
import com.example.backend.util.status.StudentStatus;
import com.example.backend.util.status.TermStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InternshipTermService {
    private final InternshipTermRepository internshipTermRepository;
    private final StudentRepository studentRepository;
    private final EmailService emailService;

    public List<InternshipTermResponse> getALL() {
        return internshipTermRepository.getALL();
    }

    // thêm mới
    public InternshipTerm create(InternshipTerm term) {

        // 1. Kiểm tra ngày bắt đầu - kết thúc
        if (term.getStartDate().isAfter(term.getEndDate())) {
            throw new AppException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        // 2. Kiểm tra hạn đăng ký đề tài nằm trong khoảng thời gian học kỳ
        if (term.getRegistrationDeadline().isBefore(term.getStartDate())) {
            throw new AppException("Hạn đăng ký đề tài phải sau ngày bắt đầu");
        }

        if (term.getRegistrationDeadline().isAfter(term.getEndDate())) {
            throw new AppException("Hạn đăng ký đề tài phải trước ngày kết thúc");
        }

        // 3. Kiểm tra trùng học kỳ
        if (internshipTermRepository
                .findByNameAndAcademicYear(term.getName(), term.getAcademicYear())
                .isPresent()) {

            throw new AppException("Học kỳ đã tồn tại trong năm học này!");
        }

        // 4. Tính status
        LocalDate today = LocalDate.now();

        if (today.isBefore(term.getStartDate())) {
            term.setStatus(TermStatus.SAP_DIEN_RA);
        } else if (!today.isAfter(term.getEndDate())) {
            term.setStatus(TermStatus.DANG_DIEN_RA);
        } else {
            term.setStatus(TermStatus.KET_THUC);
        }

        // 5. Lưu kỳ thực tập
        InternshipTerm savedTerm = internshipTermRepository.save(term);

        // 6. Gửi mail cho sinh viên đủ điều kiện
        List<Student> students = studentRepository.findByStatusAndUser_EmailIsNotNull(
                StudentStatus.DU_DIEU_KIEN
        );

        for (Student student : students) {
            emailService.sendInternshipTermOpenedMail(
                    student.getUser().getEmail(),
                    student.getFullName(),
                    savedTerm
            );
        }

        return savedTerm;
    }
    public InternshipTerm update(String id, InternshipTerm newTerm) {

        InternshipTerm term = internshipTermRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy học kỳ"));

        if (newTerm.getStartDate().isAfter(newTerm.getEndDate())) {
            throw new AppException("Ngày bắt đầu phải trước ngày kết thúc");
        }
        if (newTerm.getRegistrationDeadline().isBefore(newTerm.getStartDate())) {
            throw new AppException("Hạn đăng ký phải sau ngày bắt đầu");
        }

        if (newTerm.getRegistrationDeadline().isAfter(newTerm.getEndDate())) {
            throw new AppException("Hạn đăng ký phải trước ngày kết thúc");
        }
        internshipTermRepository
                .findByNameAndAcademicYear(newTerm.getName(), newTerm.getAcademicYear())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException("Học kỳ đã tồn tại!");
                    }
                });

        term.setName(newTerm.getName());
        term.setStartDate(newTerm.getStartDate());
        term.setEndDate(newTerm.getEndDate());
        term.setRegistrationDeadline(newTerm.getRegistrationDeadline());
        term.setAcademicYear(newTerm.getAcademicYear());
        term.setDescription(newTerm.getDescription());
        term.setUpdatedAt(LocalDateTime.now());

        return internshipTermRepository.save(term);
    }

}
