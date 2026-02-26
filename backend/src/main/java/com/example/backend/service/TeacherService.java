package com.example.backend.service;

import com.example.backend.dto.request.UserRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Teacher;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.repository.TeacherRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.EmailService;
import com.example.backend.util.Support;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final Support support;

    // ================= GET ALL =================
    public List<UserResponse> getALL() {
        return teacherRepository.getALL();
    }

    // ================= CREATE =================
    public void createTeacher(UserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email đã tồn tại");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new AppException("Số điện thoại đã tồn tại");
        }

        if (teacherRepository.existsByTeacherCode(request.getUserCode())) {
            throw new AppException("Mã giảng viên đã tồn tại");
        }

        String rawPassword = support.generatePassword();

        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole("GIANGVIEN");
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setUrlImage(request.getUrlImage());
        user.setCreatedAt(LocalDateTime.now());


        userRepository.save(user);

        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setFullName(request.getFullName());
        teacher.setTeacherCode(request.getUserCode());
        teacher.setStatus(0);
        teacherRepository.save(teacher);

        try {
            emailService.sendAccountMail(
                    request.getEmail(),
                    request.getUserCode(),
                    rawPassword
            );
        } catch (Exception e) {
            System.out.println("Gửi mail thất bại");
        }
    }

    // ================= UPDATE =================
    public void updateTeacher(String id, UserRequest request) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên"));

        User user = teacher.getUser();

        // CHECK EMAIL
        Optional<User> emailUser = userRepository.findByEmail(request.getEmail());
        if (emailUser.isPresent() &&
                !emailUser.get().getId().equals(user.getId())) {
            throw new AppException("Email đã tồn tại");
        }

        // CHECK PHONE
        Optional<User> phoneUser = userRepository.findByPhone(request.getPhone());
        if (phoneUser.isPresent() &&
                !phoneUser.get().getId().equals(user.getId())) {
            throw new AppException("Số điện thoại đã tồn tại");
        }

        // CHECK TEACHER CODE
        Optional<Teacher> codeTeacher =
                teacherRepository.findByTeacherCode(request.getUserCode());

        if (codeTeacher.isPresent() &&
                !codeTeacher.get().getId().equals(teacher.getId())) {
            throw new AppException("Mã giảng viên đã tồn tại");
        }

        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setPhone(request.getPhone());
        user.setUrlImage(request.getUrlImage());
        user.setUpdatedAt(LocalDateTime.now());

        teacher.setFullName(request.getFullName());
        teacher.setTeacherCode(request.getUserCode());

        userRepository.save(user);
        teacherRepository.save(teacher);
    }

    // ================= DELETE =================
    public void deleteTeacher(String id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy giảng viên"));
        teacher.setStatus(teacher.getStatus() == 0 ? 1 : 0);
        User user = teacher.getUser();
        user.setUpdatedAt(LocalDateTime.now());
        teacherRepository.save(teacher);
        userRepository.save(user);
    }
}