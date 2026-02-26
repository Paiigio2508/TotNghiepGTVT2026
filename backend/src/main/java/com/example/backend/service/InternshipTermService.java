package com.example.backend.service;

import com.example.backend.dto.response.InternshipTermResponse;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.exception.AppException;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.util.status.TermStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InternshipTermService {
    private final InternshipTermRepository internshipTermRepository;

    public List<InternshipTermResponse> getALL() {
        return internshipTermRepository.getALL();
    }

    // thêm mới
    public InternshipTerm create(InternshipTerm term) {

        // 1. Kiểm tra ngày hợp lệ
        if (term.getStartDate().isAfter(term.getEndDate())) {
            throw new AppException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        // 2. Kiểm tra trùng học kỳ trong cùng năm học
        if (internshipTermRepository
                .findByNameAndAcademicYear(term.getName(), term.getAcademicYear())
                .isPresent()) {

            throw new AppException("Học kỳ đã tồn tại trong năm học này!");
        }

        // 3. Tự động tính status theo ngày hiện tại
        LocalDate today = LocalDate.now();

        if (today.isBefore(term.getStartDate())) {
            term.setStatus(TermStatus.SAP_DIEN_RA);

        } else if (!today.isAfter(term.getEndDate())) {
            term.setStatus(TermStatus.DANG_DIEN_RA);

        } else {
            term.setStatus(TermStatus.KET_THUC);
        }

        return internshipTermRepository.save(term);
    }

    public InternshipTerm update(String id, InternshipTerm newTerm) {

        InternshipTerm term = internshipTermRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy học kỳ"));

        if (newTerm.getStartDate().isAfter(newTerm.getEndDate())) {
            throw new AppException("Ngày bắt đầu phải trước ngày kết thúc");
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
        term.setAcademicYear(newTerm.getAcademicYear());
        term.setDescription(newTerm.getDescription());

        return internshipTermRepository.save(term);
    }

}
