package com.philosophy.rag.features.ai.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import com.philosophy.rag.features.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Thực thể: Phiên hội thoại (ChatSession)
 * Quản lý một luồng trò chuyện giữa người dùng và AI.
 */
@Entity
@Table(name = "chat_sessions", indexes = {
        @Index(name = "idx_session_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession extends BaseEntity {

    @Id
    @Column(name = "session_id", nullable = false, updatable = false)
    private UUID sessionId;

    @PrePersist
    public void generateId() {
        if (sessionId == null) {
            sessionId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * Người dùng sở hữu phiên hội thoại này.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_session_user"))
    private User user;

    /**
     * Triết gia được chọn cho phiên hội thoại này (Bắt buộc).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "philosopher_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_session_philosopher"))
    private Philosopher philosopher;

    /**
     * Tiêu đề của cuộc hội thoại.
     */
    @Column(name = "title", length = 255)
    @Builder.Default
    private String title = "Cuộc hội thoại mới";

    /**
     * Danh sách các lượt tương tác trong phiên này.
     */
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChatHistory> history = new ArrayList<>();
}
