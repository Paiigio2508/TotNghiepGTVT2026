package com.example.backend.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherDashboardResponse {

    private ThongKeTongQuan thongKeTongQuan;
    private List<TienDoSinhVien> tienDoSinhVien;
    private List<DeadlineThongKe> danhSachDeadline;
    private List<SinhVienCanChuY> danhSachSinhVienCanChuY;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ThongKeTongQuan {
        private long tongSinhVien;
        private long deTaiChoDuyet;
        private long baoCaoChuaCham;
        private long baoCaoQuaHan;
        private long baoCaoCuoiKyChoReview;
        private double diemTrungBinh;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TienDoSinhVien {
        private String noiDung;
        private int phanTram;
        private String giaTri;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeadlineThongKe {
        private String idDeadline;
        private String tenDeadline;
        private String hanNop;
        private long daNop;
        private long chuaNop;
        private long quaHan;
        private long daCham;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SinhVienCanChuY {
        private String idPhanCong;
        private String idSinhVien;
        private String maSinhVien;
        private String tenSinhVien;
        private String tenDeTai;
        private String vanDeCanChuY;
        private Double diemTrungBinh;
        private String trangThai;
    }
}