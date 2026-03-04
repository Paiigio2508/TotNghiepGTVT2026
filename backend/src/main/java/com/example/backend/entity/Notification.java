package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import com.example.backend.util.status.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Table(name = "notifications")
@Entity
public class Notification extends BaseEntity {

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String entityId;

    private Boolean isRead = false;

    @ManyToOne
    private User user;
}