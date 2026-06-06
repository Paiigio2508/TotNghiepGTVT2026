
        package com.example.backend.service;

import com.example.backend.entity.Notification;
import com.example.backend.entity.User;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.util.status.NotificationType;
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
    public void createWeeklyDueSoonNotification(
            User user,
            String deadlineTitle,
            String entityId
    ) {
        Notification notification = new Notification();

        notification.setUser(user);
        notification.setType(NotificationType.WEEKLY_REPORT_DUE_SOON);
        notification.setTitle("Hôm nay là hạn cuối nộp báo cáo tuần");
        notification.setContent(
                "Deadline \"" + deadlineTitle + "\" sẽ đóng trong hôm nay. " +
                        "Bạn vui lòng nộp báo cáo tuần trước khi hết hạn."
        );
        notification.setEntityId(entityId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }
}

