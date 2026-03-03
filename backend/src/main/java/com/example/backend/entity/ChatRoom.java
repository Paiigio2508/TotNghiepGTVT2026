package com.example.backend.entity;

import com.example.backend.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table(name = "chat_rooms")
public class ChatRoom extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "advisor_assignment_id", nullable = false, unique = true)
    private AdvisorAssignment advisorAssignment;
}
