package com.example.backend.util;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

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
}
