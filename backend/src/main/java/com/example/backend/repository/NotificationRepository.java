package com.example.backend.repository;
import com.example.backend.entity.Notification;
import com.example.backend.util.status.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserIdAndIsReadFalse(String userId);

    boolean existsByUser_IdAndTypeAndEntityId(
            String userId,
            NotificationType type,
            String entityId
    );
}

