package com.example.backend.controller;

import com.example.backend.dto.request.ChatMessageDTO;
import com.example.backend.entity.ChatMessage;
import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageDTO request) {

        ChatRoom room = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow();

        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow();

        ChatMessage message = new ChatMessage();
        message.setChatRoom(room);
        message.setSender(sender);
        message.setMessage(request.getMessage());
        message.setIsRead(false);

        chatMessageRepository.save(message);

        // Broadcast lại room
        messagingTemplate.convertAndSend(
                "/topic/room/" + request.getRoomId(),
                message
        );
    }
}
