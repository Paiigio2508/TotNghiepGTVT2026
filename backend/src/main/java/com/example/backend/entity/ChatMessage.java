package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "chat_messages")
public class ChatMessage extends BaseEntity {

    @Column(columnDefinition = "TEXT")
    private String message;

    private Boolean isRead;

    @ManyToOne
    @JoinColumn(name = "chat_room_id", nullable = false)
    @JsonIgnore
    private ChatRoom chatRoom;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
}
