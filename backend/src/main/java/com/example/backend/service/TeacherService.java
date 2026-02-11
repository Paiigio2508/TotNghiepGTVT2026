package com.example.backend.service;

import com.example.backend.dto.request.UserRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Teacher;
import com.example.backend.entity.User;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.EmailService;
import com.example.backend.util.Support;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private  final Support support;
    public List<UserResponse> getALL() {
        return teacherRepository.getALL();
    }

    public void createTeacher(UserRequest request) {
        String rawPassword = support.generatePassword();
        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole("GIANGVIEN");
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setUrlImage(request.getUrlImage());
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus(0);
        userRepository.save(user);
        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setFullName(request.getFullName());
        teacher.setTeacherCode(request.getUserCode());
        teacherRepository.save(teacher);
        emailService.sendAccountMail(request.getEmail(), request.getUserCode(), rawPassword);
    }

    public void updateTeacher(String id, UserRequest request) {

        // Tìm student theo id
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));

        User user = teacher.getUser();
        // ===== UPDATE USER =====
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setPhone(request.getPhone());
        user.setUrlImage(request.getUrlImage());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // ===== UPDATE STUDENT =====
        teacher.setFullName(request.getFullName());
        teacher.setTeacherCode(request.getUserCode());
        teacherRepository.save(teacher);
    }

    public void deleteTeacher(String id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));
        User user = teacher.getUser();
        if (user.getStatus() == 0) {
            user.setStatus(1);
        } else {
            user.setStatus(0);
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
