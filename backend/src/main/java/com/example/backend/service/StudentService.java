package com.example.backend.service;

import com.example.backend.dto.request.UserRequest;
import com.example.backend.dto.response.ImportStudentResponse;
import com.example.backend.dto.response.StudentStatResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Specialization;
import com.example.backend.entity.Student;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.repository.SpecializationRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.EmailService;
import com.example.backend.util.status.RoleStatus;
import com.example.backend.util.status.StudentStatus;
import com.example.backend.util.Support;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
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

        String rawPassword = "gtvt@" + LocalDate.now().getYear();

        User user = new User();
        user.setUsername(request.getUserCode());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(RoleStatus.STUDENT);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setUrlImage(request.getUrlImage());
        user.setCreatedAt(LocalDateTime.now());
        user.setGender(request.getGender());
        user.setNgaySinh(request.getNgaySinh());
        userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setFullName(request.getFullName());
        student.setClassName(request.getClassName());
        student.setStudentCode(request.getUserCode());
        student.setMajor("CNTT");
        student.setStatus(StudentStatus.DU_DIEU_KIEN);
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
        user.setPhone(request.getPhone());
        user.setUrlImage(request.getUrlImage());
        user.setUpdatedAt(LocalDateTime.now());
        user.setGender(request.getGender());
        user.setNgaySinh(request.getNgaySinh());
        userRepository.save(user);

        Specialization specialization = specializationRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy ngành"));
        student.setSpecialization(specialization);
        student.setFullName(request.getFullName());
        student.setClassName(request.getClassName());
        student.setStudentCode(request.getUserCode());

        studentRepository.save(student);
    }
    public void updateStudentSpecialization(String id, UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng"));
        Student student = studentRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));

        Specialization specialization = specializationRepository.findById(request.getSpecializationId())
                .orElseThrow(() -> new AppException("Không tìm thấy ngành"));
        student.setSpecialization(specialization);

        studentRepository.save(student);
    }
    // ================= DELETE =================
    public void deleteStudent(String id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên"));
        student.setStatus(student.getStatus()== StudentStatus.DU_DIEU_KIEN?StudentStatus.KHONG_DU_DIEU_KIEN:StudentStatus.DU_DIEU_KIEN);
        User user = student.getUser();
        user.setUpdatedAt(LocalDateTime.now());
        studentRepository.save(student);
        userRepository.save(user);
    }

    public ImportStudentResponse importStudent(MultipartFile file) {

        String defaultImage = "https://www.shutterstock.com/image-vector/default-avatar-social-media-display-600nw-2632690107.jpg";

        int successCount = 0;
        int failCount = 0;
        List<String> errors = new java.util.ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {

                if (row.getRowNum() == 0) continue;

                try {
                    UserRequest request = new UserRequest();

                    String userCode = support.getCellValue(row, 0);
                    String fullName = support.getCellValue(row, 1);
                    String gender = support.getCellValue(row, 2);
                    String className = support.getCellValue(row, 3);
                    String email = support.getCellValue(row, 4);
                    String phone = support.getCellValue(row, 5);
                    String image = support.getCellValue(row, 6);
                    String ngaySinh = support.getCellValue(row, 7);

                    request.setUserCode(userCode);
                    request.setFullName(fullName);
                    request.setGender(gender);
                    request.setClassName(className);
                    request.setEmail(email);
                    request.setPhone(phone);
                    request.setUrlImage(image == null || image.isBlank() ? defaultImage : image);

                    if (ngaySinh != null && !ngaySinh.isBlank()) {
                        request.setNgaySinh(LocalDate.parse(ngaySinh));
                    }

                    createStudent(request);
                    successCount++;

                } catch (Exception e) {
                    failCount++;

                    errors.add(
                            "Dòng " + (row.getRowNum() + 1) + ": " +
                                    (e.getMessage() == null ? "Dữ liệu không hợp lệ" : e.getMessage())
                    );
                }
            }

        } catch (Exception e) {
            throw new AppException("Import thất bại: File không hợp lệ hoặc không đọc được");
        }

        if (successCount == 0 && failCount > 0) {
            throw new AppException(
                    "Import thất bại: toàn bộ dữ liệu bị lỗi. " +
                            String.join(" | ", errors)
            );
        }

        String message;

        if (failCount > 0) {
            message = "Import hoàn tất: thành công " + successCount + " dòng, lỗi " + failCount + " dòng.";
        } else {
            message = "Import thành công " + successCount + " sinh viên.";
        }

        return ImportStudentResponse.builder()
                .successCount(successCount)
                .failCount(failCount)
                .message(message)
                .errors(errors)
                .build();
    }
    public List<StudentStatResponse> getStudentStats() {
        return studentRepository.getStudentStats();
    }
}