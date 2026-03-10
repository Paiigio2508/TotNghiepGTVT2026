
        package com.example.backend.service;

import com.example.backend.entity.Notification;
import com.example.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    @Async
    public void sendNotification(Notification notification) {

        notificationRepository.save(notification);

        String userId = notification.getUser().getId();

        messagingTemplate.convertAndSend(
                "/topic/notification/" + userId,
                notification
        );

    }
}

