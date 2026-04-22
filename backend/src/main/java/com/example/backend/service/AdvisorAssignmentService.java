package com.example.backend.service;

import com.example.backend.dto.response.InternshipStudentView;
import com.example.backend.dto.response.InternshipTermResponse;
import com.example.backend.dto.response.StudentProjection;
import com.example.backend.dto.response.TeacherProjection;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.repository.*;
import com.example.backend.util.status.TermStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdvisorAssignmentService {
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final InternshipTermRepository termRepository;
    private final TeacherSpecializationTermRepository teacherSpecializationTermRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;
    private final ChatRoomRepository chatRoomRepository;

    public List<Student> getStudentsForAssignment(String termId) {

        InternshipTerm term = termRepository.findById(termId)
                .orElseThrow(() -> new AppException("Không tìm thấy học kỳ"));

        if (term.getStatus() != TermStatus.DANG_DIEN_RA) {
            throw new AppException("Chỉ phân công khi học kỳ đang diễn ra");
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
                .orElseThrow(() -> new AppException("Không tìm thấy kỳ thực tập"));

        List<Student> students = studentRepository.getALLSVDuDieuKien(termId);
        List<TeacherProjection> teachers = teacherRepository.findTeachersForAssignment(termId);

        if (students == null || students.isEmpty()) {
            throw new AppException("Không có sinh viên cần phân công");
        }

        if (teachers == null || teachers.isEmpty()) {
            throw new AppException("Không có giảng viên");
        }

        // 1. Lấy danh sách teacherId
        List<String> teacherIds = new ArrayList<>();
        for (TeacherProjection t : teachers) {
            teacherIds.add(t.getId());
        }

        // 2. Lấy entity Teacher
        List<Teacher> teacherEntities = teacherRepository.findAllById(teacherIds);
        if (teacherEntities == null || teacherEntities.isEmpty()) {
            throw new AppException("Không tìm thấy thông tin giảng viên");
        }

        // 3. Map teacherId -> Teacher
        Map<String, Teacher> teacherMap = new HashMap<>();
        for (Teacher teacher : teacherEntities) {
            teacherMap.put(teacher.getId(), teacher);
        }

        // 4. Map teacherId -> số lượng sinh viên hiện tại
        Map<String, Long> countMap = new HashMap<>();
        for (TeacherProjection t : teachers) {
            countMap.put(t.getId(), t.getAssignedCount() == null ? 0L : t.getAssignedCount());
        }

        // 5. Lấy toàn bộ thế mạnh giảng viên theo kỳ thực tập
        List<TeacherSpecializationTerm> teacherSpecializationTerms =
                teacherSpecializationTermRepository.findByTerm_IdAndTeacher_IdIn(termId, teacherIds);

        // 6. Map specializationId -> list teacherId
        Map<String, List<String>> specializationTeacherMap = new HashMap<>();

        // 7. Map teacherId -> list specializationName
        Map<String, List<String>> teacherSpecializationNameMap = new HashMap<>();

        for (TeacherSpecializationTerm tst : teacherSpecializationTerms) {
            if (tst.getTeacher() == null || tst.getSpecialization() == null) {
                continue;
            }

            String teacherId = tst.getTeacher().getId();
            String specializationId = tst.getSpecialization().getId();
            String specializationName = tst.getSpecialization().getName();

            specializationTeacherMap
                    .computeIfAbsent(specializationId, k -> new ArrayList<>())
                    .add(teacherId);

            teacherSpecializationNameMap
                    .computeIfAbsent(teacherId, k -> new ArrayList<>())
                    .add(specializationName);
        }

        // 8. Bắt đầu phân công
        for (Student student : students) {
            if (student == null) {
                continue;
            }

            Teacher selectedTeacher = null;
            boolean matchedBySpecialization = false;

            // Rule 1 + 2:
            // Ưu tiên đúng thế mạnh
            // Trong nhóm đúng thế mạnh, chọn giảng viên đang có ít sinh viên nhất
            if (student.getSpecialization() != null) {
                String studentSpecializationId = student.getSpecialization().getId();

                List<String> matchedTeacherIds = specializationTeacherMap.get(studentSpecializationId);

                if (matchedTeacherIds != null && !matchedTeacherIds.isEmpty()) {
                    selectedTeacher = findTeacherMinLoad(matchedTeacherIds, countMap, teacherMap);
                    if (selectedTeacher != null) {
                        matchedBySpecialization = true;
                    }
                }
            }

            // Rule 3 + 4:
            // - nếu sinh viên không đăng ký thế mạnh
            // - hoặc không còn giảng viên đúng thế mạnh
            // => phân vào giảng viên có ít sinh viên nhất toàn bộ
            if (selectedTeacher == null) {
                selectedTeacher = findTeacherMinLoad(teacherIds, countMap, teacherMap);
            }

            if (selectedTeacher == null) {
                throw new AppException("Không tìm được giảng viên để phân công cho sinh viên: " + student.getFullName());
            }

            AdvisorAssignment assignment = new AdvisorAssignment();
            assignment.setStudent(student);
            assignment.setTeacher(selectedTeacher);
            assignment.setTerm(term);
            assignment.setAssignedDate(LocalDate.now());

            // snapshot thế mạnh sinh viên tại thời điểm phân công
            if (student.getSpecialization() != null) {
                assignment.setStudentSpecializationSnapshot(student.getSpecialization().getName());
            } else {
                assignment.setStudentSpecializationSnapshot(null);
            }

            // snapshot thế mạnh giảng viên theo kỳ tại thời điểm phân công
            List<String> teacherSpecNames = teacherSpecializationNameMap.get(selectedTeacher.getId());
            if (teacherSpecNames != null && !teacherSpecNames.isEmpty()) {
                assignment.setTeacherSpecializationSnapshot(String.join(", ", teacherSpecNames));
            } else {
                assignment.setTeacherSpecializationSnapshot(null);
            }

            // đánh dấu kết quả phân công đúng flow
            if (matchedBySpecialization && student.getSpecialization() != null) {
                // Đúng thế mạnh
                assignment.setSpecialization(student.getSpecialization());
                assignment.setMatchedSpecializationSnapshot(student.getSpecialization().getName());

                // nếu entity của bạn có các field này thì mở ra dùng
                // assignment.setAssignmentType("AUTO");
                // assignment.setAssignmentReason("MATCHED_SPECIALIZATION");
                // assignment.setIsMatchedSpecialization(true);

            } else {
                assignment.setSpecialization(null);

                if (student.getSpecialization() == null) {
                    // Sinh viên không đăng ký thế mạnh
                    assignment.setMatchedSpecializationSnapshot("Chưa đăng ký");

                    // assignment.setAssignmentType("AUTO");
                    // assignment.setAssignmentReason("NO_SPECIALIZATION_RANDOM");
                    // assignment.setIsMatchedSpecialization(false);

                } else {
                    // Có đăng ký nhưng không còn giảng viên đúng thế mạnh
                    assignment.setMatchedSpecializationSnapshot("Không đúng thế mạnh");

                    // assignment.setAssignmentType("AUTO");
                    // assignment.setAssignmentReason("NO_MATCHING_TEACHER");
                    // assignment.setIsMatchedSpecialization(false);
                }
            }

            advisorAssignmentRepository.save(assignment);

            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setAdvisorAssignment(assignment);
            chatRoomRepository.save(chatRoom);

            // tăng số lượng sinh viên của giảng viên vừa được gán
            countMap.put(
                    selectedTeacher.getId(),
                    countMap.getOrDefault(selectedTeacher.getId(), 0L) + 1
            );
        }
    }
    private Teacher findTeacherMinLoad(List<String> candidateTeacherIds,
                                       Map<String, Long> countMap,
                                       Map<String, Teacher> teacherMap) {

        Teacher selectedTeacher = null;
        long minCount = Long.MAX_VALUE;

        for (String teacherId : candidateTeacherIds) {
            Teacher teacher = teacherMap.get(teacherId);
            if (teacher == null) {
                continue;
            }

            long currentCount = countMap.getOrDefault(teacherId, 0L);

            if (selectedTeacher == null || currentCount < minCount) {
                selectedTeacher = teacher;
                minCount = currentCount;
            }
        }

        return selectedTeacher;
    }

    //student layout
    public List<InternshipStudentView> findInternshipInfoByStudentId(String studentId) {
        return advisorAssignmentRepository.findInternshipInfoByStudentId(studentId);
    }

    @Transactional
    public void assignTopic(String studentId, String termId, Topic topic) {

        AdvisorAssignment assignment =
                advisorAssignmentRepository
                        .findByStudentIdAndTermId(studentId, termId)
                        .orElseThrow(() ->
                                new AppException("Không tìm thấy phân công")
                        );

        assignment.setTopic(topic);
    }
}