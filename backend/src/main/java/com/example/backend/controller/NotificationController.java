
package com.example.backend.controller;

import com.example.backend.entity.Notification;
import com.example.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    /* ================= LẤY NOTIFICATION ================= */

    @GetMapping("/{userId}")
    public List<Notification> getNotification(@PathVariable String userId) {

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

    }

    /* ================= ĐÁNH DẤU ĐÃ ĐỌC ================= */

    @PutMapping("/read/{id}")
    public Notification markAsRead(@PathVariable String id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification không tồn tại"));

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }

    @GetMapping("/count/{userId}")
    public long countUnread(@PathVariable String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}

