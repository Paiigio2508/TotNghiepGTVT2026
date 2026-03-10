package com.example.backend.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.dto.request.ChatMessageDTO;
import com.example.backend.entity.ChatMessage;
import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.status.MessageType;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatSocketController {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Cloudinary cloudinary;
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
        message.setFileUrl(request.getFileUrl());
        message.setFileName(request.getFileName());
        message.setMessageType(MessageType.TEXT);
        message.setMessageType(MessageType.valueOf(request.getMessageType()));

        message.setIsRead(false);

        ChatMessage saved = chatMessageRepository.save(message);

        messagingTemplate.convertAndSend(
                "/topic/room/" + request.getRoomId(),
                saved
        );

        return saved;
    }


    @PostMapping("/send-file")
    public ChatMessage sendFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("roomId") String roomId,
            @RequestParam("senderId") String senderId
    ) {

        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();

        try {

            File tempFile = File.createTempFile("chat-", file.getOriginalFilename());
            file.transferTo(tempFile);

            Map upload = cloudinary.uploader().upload(
                    tempFile,
                    ObjectUtils.asMap("resource_type", "auto")
            );

            tempFile.delete();

            String url = upload.get("secure_url").toString();

            ChatMessage message = new ChatMessage();
            message.setChatRoom(room);
            message.setSender(sender);
            message.setFileUrl(url);
            message.setFileName(file.getOriginalFilename());

            message.setMessageType(
                    file.getContentType().startsWith("image")
                            ? MessageType.IMAGE
                            : MessageType.FILE
            );

            message.setIsRead(false);

            ChatMessage saved = chatMessageRepository.save(message);

            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomId,
                    saved
            );

            return saved;

        } catch (Exception e) {
            throw new RuntimeException("Upload failed");
        }
    }
}