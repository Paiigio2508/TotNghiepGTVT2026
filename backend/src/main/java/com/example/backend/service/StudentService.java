package com.example.backend.service;

import com.example.backend.dto.request.UserRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Student;
import com.example.backend.entity.User;
import com.example.backend.repository.StudentRepository;
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
public class StudentService {
    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private  final Support support;

    public List<UserResponse> getALLSTUDENT() {
        return studentRepository.getALLSTUDENT();
    }

    public void createStudent(UserRequest request) {
        String rawPassword = support.generatePassword();
        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole("SINHVIEN");
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setUrlImage(request.getUrlImage());
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus(0);
        userRepository.save(user);
        Student student = new Student();
        student.setUser(user);
        student.setFullName(request.getFullName());
        student.setClassName(request.getClassName());
        student.setStudentCode(request.getUserCode());
        student.setMajor("CNTT");
        studentRepository.save(student);
        emailService.sendAccountMail(request.getEmail(), request.getUserCode(), rawPassword);
    }

    public void updateStudent(String id, UserRequest request) {

        // Tìm student theo id
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));

        User user = student.getUser();
        // ===== UPDATE USER =====
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setPhone(request.getPhone());
        user.setUrlImage(request.getUrlImage());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // ===== UPDATE STUDENT =====
        student.setFullName(request.getFullName());
        student.setClassName(request.getClassName());
        student.setStudentCode(request.getUserCode());

        studentRepository.save(student);
    }

    public void deleteStudent(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));
        User user = student.getUser();
        if (user.getStatus() == 0) {
            user.setStatus(1);
        } else {
            user.setStatus(0);
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
