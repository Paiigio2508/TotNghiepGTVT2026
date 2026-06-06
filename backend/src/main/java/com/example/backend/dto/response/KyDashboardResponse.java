package com.example.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KyDashboardResponse {
    private String id;
    private String tenKy;
    private String loaiKy;
    private String trangThai;
}