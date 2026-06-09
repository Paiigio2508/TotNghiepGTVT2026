package com.example.backend.util;

import com.example.backend.entity.Deadline;
import com.example.backend.entity.InternshipTerm;
import com.example.backend.util.status.DeadlineType;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    @Async
    public void sendAccountMail(String to, String username, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Thông tin tài khoản sinh viên");
        message.setText(
                "Chào bạn,\n\n" +
                        "Tài khoản của bạn đã được tạo:\n" +
                        "Username: " + username + "\n" +
                        "Password: " + password + "\n\n" +
                        "Vui lòng đăng nhập và đổi mật khẩu."
        );

        mailSender.send(message);
    }
    @Async
    public void sendDeadlineMail(String to, String studentName, Deadline deadline) {

        try {

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);

            String subject;
            String content;

            if (deadline.getType() == DeadlineType.REPORT) {

                subject = "Nhắc nhở nộp báo cáo tuần " + deadline.getWeekNo();

                content =
                        "<p>Chào <b>" + studentName + "</b>,</p>" +

                                "<p>Bạn có <b style='color:red'>báo cáo cần nộp</b>.</p>" +

                                "<p>" +
                                "<b>Tiêu đề:</b> " + deadline.getTitle() + "<br>" +
                                "<b>Tuần:</b> " + deadline.getWeekNo() + "<br>" +
                                "<b style='color:red'>Hạn nộp:</b> <b style='color:red'>" + deadline.getDueDate() + "</b>" +
                                "</p>" +

                                "<p><b>Yêu cầu:</b><br>" +
                                deadline.getDescription() +
                                "</p>" +

                                "<p><b>Giảng viên phụ trách:</b> " +
                                deadline.getTeacher().getFullName() + "</p>" +

                                "<p style='color:red'><b>⚠ Vui lòng nộp báo cáo trước thời hạn.</b></p>" +

                                "<p>Trân trọng,<br>" +
                                "<b>Hệ thống quản lý thực tập</b></p>";

            } else {

                subject = "Thông báo thực tập";

                content =
                        "<p>Chào <b>" + studentName + "</b>,</p>" +

                                "<p><b style='color:blue'>Có một thông báo mới từ giảng viên.</b></p>" +

                                "<p><b>Tiêu đề:</b> " + deadline.getTitle() + "</p>" +

                                "<p><b>Nội dung:</b><br>" +
                                deadline.getDescription() +
                                "</p>" +

                                "<p><b>Giảng viên:</b> " +
                                deadline.getTeacher().getFullName() + "</p>" +

                                "<p>Trân trọng,<br>" +
                                "<b>Hệ thống quản lý thực tập</b></p>";
            }

            helper.setSubject(subject);
            helper.setText(content, true); // true = HTML

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Async
    public void sendInternshipTermOpenedMail(String to, String studentName, InternshipTerm term) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Kỳ thực tập đã mở - Vui lòng chọn thế mạnh");

            LocalDate strengthDeadline = term.getStartDate().plusDays(3);

            String content =
                    "<p>Chào <b>" + studentName + "</b>,</p>" +

                            "<p><b style='color:green'>Kỳ thực tập mới đã được mở trên hệ thống.</b></p>" +

                            "<p>" +
                            "<b>Tên kỳ:</b> " + term.getName() + "<br>" +
                            "<b>Năm học:</b> " + term.getAcademicYear() + "<br>" +
                            "<b>Thời gian thực tập:</b> " + term.getStartDate() + " đến " + term.getEndDate() + "<br>" +
                            "<b style='color:red'>Hạn chọn thế mạnh:</b> " + strengthDeadline +
                            "</p>" +

                            "<p>Sinh viên vui lòng đăng nhập hệ thống và tiến hành <b>chọn thế mạnh</b> để nhà trường phân công giảng viên hướng dẫn phù hợp.</p>" +

                            "<p style='color:red'><b>⚠ Nếu sinh viên không chọn thế mạnh trước hạn, nhà trường sẽ tự động phân công giảng viên ngẫu nhiên.</b></p>" +

                            "<p>Trân trọng,<br>" +
                            "<b>Hệ thống quản lý thực tập</b></p>";

            helper.setText(content, true);

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
