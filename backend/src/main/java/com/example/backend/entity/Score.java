package com.example.backend.entity;


import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "scores")
public class Score extends BaseEntity {

    private Double score;

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToOne
    @JoinColumn(name = "weekly_report_id")
    private WeeklyReport weeklyReport;
}
