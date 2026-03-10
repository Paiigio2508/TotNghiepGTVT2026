package com.example.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDTO {
    private String roomId;
    private String senderId;
    private String message;
    private String fileUrl;
    private String fileName;

    private String messageType;
}
