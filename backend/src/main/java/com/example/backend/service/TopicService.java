package com.example.backend.service;

import com.example.backend.dto.request.TopicRequest;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.repository.*;
import com.example.backend.util.status.TopicStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final StudentRepository studentRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;

    public List<Topic> getTopicsByUser(String userId) {

        Student student = studentRepository
                .findByUser_Id(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        return topicRepository.findByStudent(student);
    }

    public Topic createTopicByUser(String userId, TopicRequest request) {

        Student student = studentRepository
                .findByUser_Id(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        boolean existsApproved = topicRepository
                .existsByStudentAndStatus(
                        student,
                        TopicStatus.APPROVED_BY_ADMIN
                );

        if (existsApproved) {
            throw new AppException("Bạn đã có đề tài được duyệt!");
        }

        Topic topic = new Topic();
        topic.setTitle(request.getTitle());
        topic.setDescription(request.getDescription());
        topic.setStudent(student);
        topic.setStatus(TopicStatus.PENDING);

        return topicRepository.save(topic);
    }

    /* ================= SINH VIÊN CẬP NHẬT ================= */
    public Topic updateTopicByUser(String topicId, String userId, TopicRequest request) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new AppException("Không tìm thấy đề tài"));

        Student student = studentRepository
                .findByUser_Id(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        if (!topic.getStudent().getId().equals(student.getId())) {
            throw new AppException("Không có quyền chỉnh sửa");
        }

        if (topic.getStatus() != TopicStatus.PENDING) {
            throw new AppException("Chỉ được chỉnh sửa khi đang chờ duyệt");
        }

        topic.setTitle(request.getTitle());
        topic.setDescription(request.getDescription());

        return topicRepository.save(topic);
    }

    /* ================= SINH VIÊN HỦY ================= */
    public void cancelTopicByUser(String topicId, String userId) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new AppException("Không tìm thấy đề tài"));

        Student student = studentRepository
                .findByUser_Id(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        // ❌ Không phải đề tài của mình
        if (!topic.getStudent().getId().equals(student.getId())) {
            throw new AppException("Bạn không có quyền hủy đề tài này");
        }

        // ❌ Chỉ được hủy khi đang PENDING
        if (topic.getStatus() != TopicStatus.PENDING) {
            throw new AppException("Chỉ được hủy khi đề tài đang chờ duyệt");
        }

        topic.setStatus(TopicStatus.CANCELLED_BY_STUDENT);

        topicRepository.save(topic);
    }

    /* ================= GIẢNG VIÊN DUYỆT ================= */
    public Topic approveByTeacher(String topicId) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new AppException("Không tìm thấy đề tài"));

        if (topic.getStatus() != TopicStatus.PENDING) {
            throw new AppException("Trạng thái đề tài không hợp lệ");
        }

        topic.setStatus(TopicStatus.APPROVED_BY_TEACHER);
        return topicRepository.save(topic);
    }

    /* ================= GIẢNG VIÊN TỪ CHỐI ================= */
    public Topic rejectByTeacher(String topicId) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new AppException("Không tìm thấy đề tài"));

        if (topic.getStatus() != TopicStatus.PENDING) {
            throw new AppException("Trạng thái đề tài không hợp lệ");
        }

        topic.setStatus(TopicStatus.REJECTED_BY_TEACHER);
        return topicRepository.save(topic);
    }

//    /* ================= ADMIN DUYỆT CUỐI ================= */
//    public Topic approveByAdmin(String topicId) {
//
//        Topic topic = topicRepository.findById(topicId)
//                .orElseThrow(() -> new AppException("Không tìm thấy đề tài"));
//
//        if (topic.getStatus() != TopicStatus.APPROVED_BY_TEACHER) {
//            throw new AppException("Đề tài phải được giảng viên duyệt trước");
//        }
//
//        topic.setStatus(TopicStatus.APPROVED_BY_ADMIN);
//
//        // 🔥 Gán vào AdvisorAssignment
//        AdvisorAssignment assignment =
//                advisorAssignmentRepository
//                        .findByStudentAndTerm(
//                                topic.getStudent(),
//                                topic.getTerm()
//                        )
//                        .orElseThrow(() ->
//                                new AppException("Chưa phân công giảng viên cho sinh viên trong kỳ này"));
//
//        assignment.setTopic(topic);
//        assignment.setAssignedDate(LocalDate.now());
//
//        advisorAssignmentRepository.save(assignment);
//
//        return topicRepository.save(topic);
//    }


}