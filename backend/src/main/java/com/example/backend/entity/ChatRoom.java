package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "chat_rooms")
public class ChatRoom extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "advisor_assignment_id", nullable = false)
    private AdvisorAssignment advisorAssignment;
}
