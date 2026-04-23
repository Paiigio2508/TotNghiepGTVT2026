package com.example.backend.service;

import com.example.backend.dto.request.TopicRequest;
import com.example.backend.dto.response.TopicAdminView;
import com.example.backend.dto.response.TopicTeacherView;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.repository.AdvisorAssignmentRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.TopicRepository;
import com.example.backend.util.status.NotificationType;
import com.example.backend.util.status.TopicStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final StudentRepository studentRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;
    private final AdvisorAssignmentService advisorAssignmentService;
    private final NotificationService notificationService;

    public List<Topic> getTopicsByUser(String userId) {

        Student student = studentRepository
                .findByUser_Id(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        return topicRepository.findByStudentOrderByCreatedAtDesc(student);
    }

    public void createTopicByUser(String userId, TopicRequest request) {

        Student student = studentRepository
                .findByUser_Id(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        AdvisorAssignment assignment = advisorAssignmentRepository
                .findByStudent(student)
                .orElseThrow(() -> new AppException("Sinh viên chưa được phân công"));

        InternshipTerm term = assignment.getTerm();

        boolean existsApproved = topicRepository.existsByStudentAndStatus(
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
        topic.setTerm(term);

        topicRepository.save(topic);
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


        if (!topic.getStudent().getId().equals(student.getId())) {
            throw new AppException("Bạn không có quyền hủy đề tài này");
        }

        if (topic.getStatus() != TopicStatus.PENDING) {
            throw new AppException("Chỉ được hủy khi đề tài đang chờ duyệt");
        }

        topic.setStatus(TopicStatus.CANCELLED_BY_STUDENT);

        topicRepository.save(topic);
    }

    public List<TopicTeacherView> findTopicsByTeacherAndTerm(String userID, String termID) {
        return topicRepository.findTopicsByTeacherAndTerm(userID, termID);
    }

    /* ================= GIẢNG VIÊN DUYỆT ================= */
    @Transactional
    public void approveTopic(String topicId) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài"));

        topic.setStatus(TopicStatus.APPROVED_BY_TEACHER);
        topicRepository.save(topic);

        // 2️⃣ Reject các topic khác
        topicRepository.rejectOtherTopics(
                topic.getStudent().getId(),
                topic.getTerm().getId(),
                topic.getId(),
                TopicStatus.REJECTED_BY_TEACHER
        );

        Student student = topic.getStudent();

        Notification notification = new Notification();
        notification.setTitle("Đề tài đã được duyệt");
        notification.setContent(
                "Đề tài \"" + topic.getTitle() + "\" đã được giảng viên duyệt"
        );
        notification.setUser(student.getUser());
        notification.setType(NotificationType.TOPIC_APPROVED_BY_TEACHER);
        notification.setEntityId(topic.getId());

        notificationService.sendNotification(notification);
    }

    /* ================= GIẢNG VIÊN TỪ CHỐI ================= */
    @Transactional
    public void rejectTopic(String topicId) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài"));

        // Nếu đã APPROVED thì không cho reject (tuỳ bạn)
        if (topic.getStatus() == TopicStatus.APPROVED_BY_ADMIN) {
            throw new RuntimeException("Không thể từ chối đề tài đã duyệt");
        }

        topic.setStatus(TopicStatus.REJECTED_BY_TEACHER);
        topicRepository.save(topic);
    }

    public List<TopicAdminView> findTopicForAdmin(String termID) {
        return topicRepository.findForAdmin(termID);
    }

    @Transactional
    public void adminApproveTopic(String topicId) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài"));

        // Đổi trạng thái
        topic.setStatus(TopicStatus.APPROVED_BY_ADMIN);

        // Gán topic vào advisor assignment
        advisorAssignmentService.assignTopic(
                topic.getStudent().getId(),
                topic.getTerm().getId(),
                topic
        );
        Student student = topic.getStudent();

        Notification notification = new Notification();
        notification.setTitle("Đề tài duyệt chính thức");
        notification.setContent(
                "Đề tài \"" + topic.getTitle() + "\" đã được admin duyệt cuối cùng "
        );
        notification.setUser(student.getUser());
        notification.setType(NotificationType.TOPIC_APPROVED_BY_ADMIN);
        notification.setEntityId(topic.getId());

        notificationService.sendNotification(notification);
    }
}