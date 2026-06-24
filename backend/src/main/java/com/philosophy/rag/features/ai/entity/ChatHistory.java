package com.philosophy.rag.features.ai.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import com.philosophy.rag.features.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Thực thể: Lịch sử trò chuyện (ChatHistory)
 * Lưu trữ thông tin về một lượt tương tác giữa người dùng và AI,
 * bao gồm nội dung câu hỏi, câu trả lời và thời gian xử lý.
 */
@Entity
@Table(name = "chat_histories", indexes = {
        @Index(name = "idx_chat_history_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatHistory extends BaseEntity {

    @Id
    @Column(name = "history_id", nullable = false, updatable = false)
    private UUID historyId;

    @PrePersist
    public void generateId() {
        if (historyId == null) {
            historyId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * Phiên hội thoại chứa tương tác này.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id",
                foreignKey = @ForeignKey(name = "fk_chat_history_session"))
    private ChatSession session;

    /**
     * Người dùng tham gia hội thoại.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_chat_history_user"))
    private User user;

    /**
     * Triết gia tham gia hội thoại (Có thể null nếu không chọn triết gia cụ thể).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "philosopher_id",
                foreignKey = @ForeignKey(name = "fk_chat_history_philosopher"))
    private Philosopher philosopher;

    /**
     * Nội dung câu hỏi của người dùng.
     */
    @Column(name = "query", columnDefinition = "TEXT", nullable = false)
    private String query;

    /**
     * Nội dung phản hồi của AI.
     */
    @Column(name = "response", columnDefinition = "TEXT", nullable = false)
    private String response;

    /**
     * Thời điểm bắt đầu yêu cầu.
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * Thời điểm hoàn tất phản hồi (bao gồm cả TTS nếu có).
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /**
     * Thời gian xử lý tương tác tính bằng miligiây.
     */
    @Column(name = "duration_millis", nullable = false)
    private Long durationMillis;
}
