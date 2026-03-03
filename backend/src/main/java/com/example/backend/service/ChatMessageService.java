package com.example.backend.service;

import com.example.backend.dto.request.ChatMessageDTO;
import com.example.backend.entity.ChatMessage;
import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatMessageService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatMessage saveMessage(ChatMessageDTO dto) {

        ChatRoom room = chatRoomRepository.findById(dto.getRoomId())
                .orElseThrow();

        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow();

        ChatMessage message = new ChatMessage();
        message.setMessage(dto.getMessage());
        message.setIsRead(false);
        message.setChatRoom(room);
        message.setSender(sender);
        return chatMessageRepository.save(message);
    }
}
