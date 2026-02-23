package com.example.backend.service;

import com.example.backend.dto.request.UserRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Student;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.EmailService;
import com.example.backend.util.Support;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final Support support;

    // ================= GET ALL =================
    public List<UserResponse> getALLSTUDENT() {
        return studentRepository.getALLSTUDENT();
    }

    // ================= CREATE =================
    public void createStudent(UserRequest request) {

        // CHECK EMAIL
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email đã tồn tại");
        }

        // CHECK PHONE
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new AppException("Số điện thoại đã tồn tại");
        }

        // CHECK STUDENT CODE
        if (studentRepository.existsByStudentCode(request.getUserCode())) {
            throw new AppException("Mã sinh viên đã tồn tại");
        }

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

        // Gửi mail (không làm crash)
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
    public void updateStudent(String id, UserRequest request) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        User user = student.getUser();

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

        // CHECK STUDENT CODE
        Optional<Student> codeStudent =
                studentRepository.findByStudentCode(request.getUserCode());

        if (codeStudent.isPresent() &&
                !codeStudent.get().getId().equals(student.getId())) {
            throw new AppException("Mã sinh viên đã tồn tại");
        }

        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setPhone(request.getPhone());
        user.setUrlImage(request.getUrlImage());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        student.setFullName(request.getFullName());
        student.setClassName(request.getClassName());
        student.setStudentCode(request.getUserCode());

        studentRepository.save(student);
    }

    // ================= DELETE =================
    public void deleteStudent(String id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        User user = student.getUser();

        user.setStatus(user.getStatus() == 0 ? 1 : 0);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    public void importStudent(MultipartFile file) {

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {

                if (row.getRowNum() == 0) continue;

                try {
                    UserRequest request = new UserRequest();
                    request.setUserCode(row.getCell(0).getStringCellValue());
                    request.setFullName(row.getCell(1).getStringCellValue());
                    request.setClassName(row.getCell(2).getStringCellValue());
                    request.setEmail(row.getCell(3).getStringCellValue());
                    request.setPhone(row.getCell(4).getStringCellValue());

                    createStudent(request);

                } catch (Exception e) {
                    System.out.println("Lỗi dòng: " + row.getRowNum());
                    e.printStackTrace();
                }
            }

        } catch (Exception e) {
            throw new AppException("Import thất bại");
        }
    }
}