package com.example.backend.service;

import com.example.backend.dto.response.InternshipTermResponse;
import com.example.backend.dto.response.StudentProjection;
import com.example.backend.dto.response.TeacherProjection;
import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.entity.Student;
import com.example.backend.entity.Teacher;
import com.example.backend.repository.AdvisorAssignmentRepository;
import com.example.backend.repository.InternshipTermRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.util.status.TermStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdvisorAssignmentService {
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final InternshipTermRepository termRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;

    public List<Student> getStudentsForAssignment(String termId) {

        InternshipTerm term = termRepository.findById(termId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học kỳ"));

        if (term.getStatus() != TermStatus.DANG_DIEN_RA) {
            throw new RuntimeException("Chỉ phân công khi học kỳ đang diễn ra");
        }

        return studentRepository.getALLSVDuDieuKien(termId);
    }

    public List<TeacherProjection> findTeachersForAssignment(String termId) {
        return teacherRepository.findTeachersForAssignment(termId);
    }
    public List<InternshipTermResponse> getALLSVPhanCong(String termId) {
        return advisorAssignmentRepository.getALLSVPhanCong(termId);
    }
    public List<StudentProjection> getStudentsByTerm(String teacherId, String termId) {
        return advisorAssignmentRepository.findStudentsByTeacherAndTerm(teacherId, termId);
    }
    @Transactional
    public void autoAssign(String termId) {

        InternshipTerm term = termRepository.findById(termId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kỳ thực tập"));

        List<Student> students = studentRepository.getALLSVDuDieuKien(termId);
        List<TeacherProjection> teachers =
                teacherRepository.findTeachersForAssignment(termId);

        if (students.isEmpty()) {
            throw new RuntimeException("Không có sinh viên cần phân công");
        }

        if (teachers.isEmpty()) {
            throw new RuntimeException("Không có giảng viên");
        }

        // 1️⃣ Lấy toàn bộ Teacher entity 1 lần
        List<String> teacherIds = new ArrayList<>();
        for (TeacherProjection t : teachers) {
            teacherIds.add(t.getId());
        }

        List<Teacher> teacherEntities = teacherRepository.findAllById(teacherIds);

        // 2️⃣ Tạo list count có thể thay đổi
        List<Long> counts = new ArrayList<>();
        for (TeacherProjection t : teachers) {
            counts.add(t.getAssignedCount());
        }

        // 3️⃣ Bắt đầu phân công
        for (Student student : students) {

            // tìm giảng viên có số sinh viên ít nhất
            int minIndex = 0;
            for (int i = 1; i < counts.size(); i++) {
                if (counts.get(i) < counts.get(minIndex)) {
                    minIndex = i;
                }
            }

            Teacher teacher = teacherEntities.get(minIndex);

            AdvisorAssignment assignment = new AdvisorAssignment();
            assignment.setStudent(student);
            assignment.setTeacher(teacher);
            assignment.setTerm(term);
            assignment.setAssignedDate(LocalDate.now());

            advisorAssignmentRepository.save(assignment);

            // tăng số lượng của giảng viên đó lên
            counts.set(minIndex, counts.get(minIndex) + 1);
        }
    }
}