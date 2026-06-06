package com.example.backend.service;

import com.example.backend.dto.response.TeacherDashboardResponse;
import com.example.backend.entity.AdvisorAssignment;
import com.example.backend.entity.Deadline;
import com.example.backend.entity.FinalReport;
import com.example.backend.entity.User;
import com.example.backend.entity.WeeklyReport;
import com.example.backend.repository.AdvisorAssignmentRepository;
import com.example.backend.repository.DeadlineRepository;
import com.example.backend.repository.FinalReportRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherDashboardService {

    private final UserRepository userRepository;
    private final AdvisorAssignmentRepository advisorAssignmentRepository;
    private final DeadlineRepository deadlineRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final FinalReportRepository finalReportRepository;

    private final DateTimeFormatter dinhDangNgay = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional(readOnly = true)
    public TeacherDashboardResponse layThongKeDashboard(String idKy, Principal principal) {
        String idUserGiangVien = layIdUserDangNhap(principal);

        List<AdvisorAssignment> danhSachPhanCong =
                advisorAssignmentRepository.findAllByGiangVienAndKy(idUserGiangVien, idKy);

        /*
         * Repo deadline đã lọc type = REPORT.
         * Nếu repo chưa lọc thì hàm laDeadlineReport bên dưới vẫn chặn thêm lần nữa.
         */
        List<Deadline> danhSachDeadline = deadlineRepository
                .findAllByGiangVienAndKy(idUserGiangVien, idKy)
                .stream()
                .filter(this::laDeadlineReport)
                .toList();

        List<String> danhSachIdPhanCong = danhSachPhanCong.stream()
                .map(AdvisorAssignment::getId)
                .toList();

        List<String> danhSachIdDeadlineReport = danhSachDeadline.stream()
                .map(Deadline::getId)
                .toList();

        Set<String> setIdDeadlineReport = new HashSet<>(danhSachIdDeadlineReport);

        List<WeeklyReport> danhSachBaoCaoTuan = layBaoCaoTuan(
                danhSachIdPhanCong,
                danhSachIdDeadlineReport
        );

        /*
         * Chặn chắc chắn: chỉ giữ report có deadline_id nằm trong danh sách deadline REPORT.
         */
        danhSachBaoCaoTuan = danhSachBaoCaoTuan.stream()
                .filter(wr -> wr.getDeadline() != null)
                .filter(wr -> setIdDeadlineReport.contains(wr.getDeadline().getId()))
                .toList();

        List<FinalReport> danhSachBaoCaoCuoiKy =
                layBaoCaoCuoiKy(danhSachIdPhanCong);

        long tongSinhVien = danhSachPhanCong.size();

        long deTaiChoDuyet = 0;

        /*
         * Chưa làm luồng chấm báo cáo tuần nên để 0.
         * Không dùng comment để suy ra "chưa chấm" nữa.
         */
        long baoCaoChuaCham = 0;

        long baoCaoQuaHan = demSinhVienQuaHan(
                danhSachPhanCong,
                danhSachDeadline,
                danhSachBaoCaoTuan
        );

        long baoCaoCuoiKyChoReview = danhSachBaoCaoCuoiKy.stream()
                .filter(this::daNopBaoCaoCuoiKy)
                .filter(fr -> isBlank(fr.getComment()))
                .count();

        long soSinhVienDaNopBaoCaoCuoiKy = danhSachBaoCaoCuoiKy.stream()
                .filter(this::daNopBaoCaoCuoiKy)
                .count();

        Deadline deadlineGanNhat = layDeadlineGanNhat(danhSachDeadline);

        long soDaNopDeadlineGanNhat = 0;

        if (deadlineGanNhat != null) {
            soDaNopDeadlineGanNhat = demDaNopTheoDeadline(
                    danhSachBaoCaoTuan,
                    deadlineGanNhat.getId()
            );
        }

        TeacherDashboardResponse.ThongKeTongQuan thongKeTongQuan =
                TeacherDashboardResponse.ThongKeTongQuan.builder()
                        .tongSinhVien(tongSinhVien)
                        .deTaiChoDuyet(deTaiChoDuyet)
                        .baoCaoChuaCham(baoCaoChuaCham)
                        .baoCaoQuaHan(baoCaoQuaHan)
                        .baoCaoCuoiKyChoReview(baoCaoCuoiKyChoReview)
                        .diemTrungBinh(0)
                        .build();

        List<TeacherDashboardResponse.TienDoSinhVien> tienDoSinhVien = List.of(
                taoTienDo("Sinh viên đã được phân công", tongSinhVien, tongSinhVien),
                taoTienDo("Sinh viên đã nộp báo cáo tuần gần nhất", soDaNopDeadlineGanNhat, tongSinhVien),
                taoTienDo("Sinh viên đã nộp báo cáo cuối kỳ", soSinhVienDaNopBaoCaoCuoiKy, tongSinhVien)
        );

        List<TeacherDashboardResponse.DeadlineThongKe> danhSachDeadlineThongKe =
                taoDanhSachDeadlineThongKe(
                        danhSachDeadline,
                        danhSachBaoCaoTuan,
                        tongSinhVien
                );

        List<TeacherDashboardResponse.SinhVienCanChuY> danhSachSinhVienCanChuY =
                taoDanhSachSinhVienCanChuY(
                        danhSachPhanCong,
                        danhSachDeadline,
                        danhSachBaoCaoTuan,
                        danhSachBaoCaoCuoiKy
                );

        return TeacherDashboardResponse.builder()
                .thongKeTongQuan(thongKeTongQuan)
                .tienDoSinhVien(tienDoSinhVien)
                .danhSachDeadline(danhSachDeadlineThongKe)
                .danhSachSinhVienCanChuY(danhSachSinhVienCanChuY)
                .build();
    }

    private List<WeeklyReport> layBaoCaoTuan(
            List<String> danhSachIdPhanCong,
            List<String> danhSachIdDeadline
    ) {
        if (danhSachIdPhanCong.isEmpty() || danhSachIdDeadline.isEmpty()) {
            return new ArrayList<>();
        }

        return weeklyReportRepository.findAllByDanhSachPhanCongAndDeadline(
                danhSachIdPhanCong,
                danhSachIdDeadline
        );
    }

    private List<FinalReport> layBaoCaoCuoiKy(List<String> danhSachIdPhanCong) {
        if (danhSachIdPhanCong.isEmpty()) {
            return new ArrayList<>();
        }

        return finalReportRepository.findAllByDanhSachPhanCong(danhSachIdPhanCong);
    }

    private String layIdUserDangNhap(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new RuntimeException("Không xác định được tài khoản đăng nhập");
        }

        String login = principal.getName();

        return userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user đăng nhập: " + login));
    }

    private TeacherDashboardResponse.TienDoSinhVien taoTienDo(
            String noiDung,
            long hienTai,
            long tong
    ) {
        int phanTram = tong == 0 ? 0 : (int) Math.round(hienTai * 100.0 / tong);

        return TeacherDashboardResponse.TienDoSinhVien.builder()
                .noiDung(noiDung)
                .phanTram(phanTram)
                .giaTri(hienTai + "/" + tong)
                .build();
    }

    private List<TeacherDashboardResponse.DeadlineThongKe> taoDanhSachDeadlineThongKe(
            List<Deadline> danhSachDeadline,
            List<WeeklyReport> danhSachBaoCaoTuan,
            long tongSinhVien
    ) {
        LocalDateTime hienTai = LocalDateTime.now();

        return danhSachDeadline.stream()
                .map(deadline -> {
                    long daNop = demDaNopTheoDeadline(danhSachBaoCaoTuan, deadline.getId());
                    long chuaNop = Math.max(tongSinhVien - daNop, 0);

                    long quaHan = 0;
                    if (deadline.getDueDate() != null && deadline.getDueDate().isBefore(hienTai)) {
                        quaHan = chuaNop;
                    }

                    return TeacherDashboardResponse.DeadlineThongKe.builder()
                            .idDeadline(deadline.getId())
                            .tenDeadline(deadline.getTitle())
                            .hanNop(dinhDangNgay(deadline.getDueDate()))
                            .daNop(daNop)
                            .chuaNop(chuaNop)
                            .quaHan(quaHan)
                            .daCham(0)
                            .build();
                })
                .toList();
    }

    private List<TeacherDashboardResponse.SinhVienCanChuY> taoDanhSachSinhVienCanChuY(
            List<AdvisorAssignment> danhSachPhanCong,
            List<Deadline> danhSachDeadline,
            List<WeeklyReport> danhSachBaoCaoTuan,
            List<FinalReport> danhSachBaoCaoCuoiKy
    ) {
        Deadline deadlineGanNhat = layDeadlineGanNhat(danhSachDeadline);

        Map<String, FinalReport> finalTheoPhanCong =
                danhSachBaoCaoCuoiKy.stream()
                        .filter(fr -> fr.getAdvisorAssignment() != null)
                        .collect(Collectors.toMap(
                                fr -> fr.getAdvisorAssignment().getId(),
                                fr -> fr,
                                (cu, moi) -> moi
                        ));

        List<TeacherDashboardResponse.SinhVienCanChuY> ketQua = new ArrayList<>();

        for (AdvisorAssignment phanCong : danhSachPhanCong) {
            String idPhanCong = phanCong.getId();

            String vanDe = null;
            String trangThai = null;

            if (deadlineGanNhat != null
                    && deadlineGanNhat.getDueDate() != null
                    && deadlineGanNhat.getDueDate().isBefore(LocalDateTime.now())
                    && !daNopDeadline(danhSachBaoCaoTuan, idPhanCong, deadlineGanNhat.getId())) {
                vanDe = "Chưa nộp deadline gần nhất";
                trangThai = "error";
            }

            FinalReport finalReport = finalTheoPhanCong.get(idPhanCong);

            if (vanDe == null
                    && finalReport != null
                    && daNopBaoCaoCuoiKy(finalReport)
                    && isBlank(finalReport.getComment())) {
                vanDe = "Báo cáo cuối kỳ chờ review";
                trangThai = "processing";
            }

            if (vanDe == null) {
                continue;
            }

            ketQua.add(
                    TeacherDashboardResponse.SinhVienCanChuY.builder()
                            .idPhanCong(idPhanCong)
                            .idSinhVien(layIdSinhVien(phanCong))
                            .maSinhVien(layMaSinhVien(phanCong))
                            .tenSinhVien(layTenSinhVien(phanCong))
                            .tenDeTai("Chưa cập nhật")
                            .vanDeCanChuY(vanDe)
                            .diemTrungBinh(null)
                            .trangThai(trangThai)
                            .build()
            );
        }

        return ketQua.stream()
                .limit(10)
                .toList();
    }

    private long demDaNopTheoDeadline(
            List<WeeklyReport> danhSachBaoCaoTuan,
            String idDeadline
    ) {
        return danhSachBaoCaoTuan.stream()
                .filter(wr -> wr.getDeadline() != null)
                .filter(wr -> Objects.equals(wr.getDeadline().getId(), idDeadline))
                .filter(this::daNopBaoCaoTuan)
                .count();
    }

    private long demSinhVienQuaHan(
            List<AdvisorAssignment> danhSachPhanCong,
            List<Deadline> danhSachDeadline,
            List<WeeklyReport> danhSachBaoCaoTuan
    ) {
        Set<String> danhSachIdPhanCongQuaHan = new HashSet<>();
        LocalDateTime hienTai = LocalDateTime.now();

        for (Deadline deadline : danhSachDeadline) {
            if (deadline.getDueDate() == null || deadline.getDueDate().isAfter(hienTai)) {
                continue;
            }

            for (AdvisorAssignment phanCong : danhSachPhanCong) {
                boolean daNop = daNopDeadline(
                        danhSachBaoCaoTuan,
                        phanCong.getId(),
                        deadline.getId()
                );

                if (!daNop) {
                    danhSachIdPhanCongQuaHan.add(phanCong.getId());
                }
            }
        }

        return danhSachIdPhanCongQuaHan.size();
    }

    private boolean daNopDeadline(
            List<WeeklyReport> danhSachBaoCaoTuan,
            String idPhanCong,
            String idDeadline
    ) {
        return danhSachBaoCaoTuan.stream()
                .filter(wr -> wr.getAdvisorAssignment() != null)
                .filter(wr -> wr.getDeadline() != null)
                .filter(wr -> Objects.equals(wr.getAdvisorAssignment().getId(), idPhanCong))
                .filter(wr -> Objects.equals(wr.getDeadline().getId(), idDeadline))
                .anyMatch(this::daNopBaoCaoTuan);
    }

    private Deadline layDeadlineGanNhat(List<Deadline> danhSachDeadline) {
        return danhSachDeadline.stream()
                .filter(d -> d.getDueDate() != null)
                .max(Comparator.comparing(Deadline::getDueDate))
                .orElse(null);
    }

    private boolean laDeadlineReport(Deadline deadline) {
        return deadline != null
                && deadline.getType() != null
                && "REPORT".equalsIgnoreCase(deadline.getType().toString());
    }

    private boolean daNopBaoCaoTuan(WeeklyReport weeklyReport) {
        return weeklyReport != null && !isBlank(weeklyReport.getFileUrl());
    }

    private boolean daNopBaoCaoCuoiKy(FinalReport finalReport) {
        return finalReport != null && !isBlank(finalReport.getFileUrl());
    }

    private String dinhDangNgay(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }

        return dateTime.format(dinhDangNgay);
    }

    private String layIdSinhVien(AdvisorAssignment phanCong) {
        if (phanCong.getStudent() == null) {
            return "";
        }

        return phanCong.getStudent().getId();
    }

    private String layMaSinhVien(AdvisorAssignment phanCong) {
        if (phanCong.getStudent() == null) {
            return "";
        }

        if (phanCong.getStudent().getStudentCode() != null) {
            return phanCong.getStudent().getStudentCode();
        }

        if (phanCong.getStudent().getUser() != null) {
            return phanCong.getStudent().getUser().getUsername();
        }

        return "";
    }

    private String layTenSinhVien(AdvisorAssignment phanCong) {
        if (phanCong.getStudent() == null || phanCong.getStudent().getUser() == null) {
            return "Sinh viên";
        }

        return phanCong.getStudent().getUser().getUsername();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}