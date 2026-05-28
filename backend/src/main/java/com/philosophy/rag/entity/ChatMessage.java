package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;


/**
 * Thực thể: Tin nhắn hội thoại (ChatMessage)
 * Lưu trữ lịch sử trò chuyện giữa người dùng và triết gia AI
 * phục vụ tính năng Khu vực Đàm đạo.
 */
@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_user_id", columnList = "user_id"),
        @Index(name = "idx_chat_philosopher_id", columnList = "philosopher_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage extends BaseEntity {


    @Id
    @Column(name = "message_id", nullable = false, updatable = false)
    private UUID messageId;

    @PrePersist
    public void generateId() {
        if (messageId == null) {
            messageId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * Người dùng gửi / nhận tin nhắn — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều ChatMessage thuộc một User.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_chat_message_user"))
    private User user;

    /**
     * Triết gia tham gia hội thoại — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều ChatMessage thuộc một Philosopher.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "philosopher_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_chat_message_philosopher"))
    private Philosopher philosopher;

    /**
     * Nội dung tin nhắn.
     * Có thể là văn bản hoặc đường dẫn tệp ghi âm (audio URL).
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * Loại người gửi (SenderType).
     * Sử dụng Enum: 'USER' hoặc 'AI'.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false, length = 10)
    private SenderType senderType;

//    /** Thời gian gửi — tự động gán khi persist */
//    @CreationTimestamp
//    @Column(name = "timestamp", nullable = false, updatable = false)
//    private Instant timestamp;

    // ── Enum nội bộ ──────────────────────────────────────────────────────────

    /**
     * Phân loại người gửi trong hội thoại.
     */
    public enum SenderType {
        /** Tin nhắn do người dùng gửi */
        USER,
        /** Tin nhắn do AI (triết gia) phản hồi */
        AI
    }
}
