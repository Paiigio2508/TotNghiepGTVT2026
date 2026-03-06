package com.example.backend.controller;

import com.example.backend.dto.request.ChatMessageDTO;
import com.example.backend.entity.ChatMessage;
import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatSocketController {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public ChatMessage sendMessage(@RequestBody ChatMessageDTO request) {

        ChatRoom room = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow();

        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow();

        ChatMessage message = new ChatMessage();
        message.setChatRoom(room);
        message.setSender(sender);
        message.setMessage(request.getMessage());
        message.setIsRead(false);

        ChatMessage saved = chatMessageRepository.save(message);

        // broadcast realtime
        messagingTemplate.convertAndSend(
                "/topic/room/" + request.getRoomId(),
                saved
        );

        return saved;
    }
}