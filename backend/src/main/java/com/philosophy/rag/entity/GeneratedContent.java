package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Thực thể: Nội dung sáng tạo (GeneratedContent)
 * Quản lý kịch bản và video do hệ thống tạo ra từ form nhập liệu
 * của người dùng trong Xưởng Sáng tạo.
 */
@Entity
@Table(name = "generated_contents", indexes = {
        @Index(name = "idx_gen_content_user_id", columnList = "user_id"),
        @Index(name = "idx_gen_content_saved", columnList = "is_saved_to_library")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedContent extends BaseEntity {

    /** Mã nội dung — Khóa chính, tự tăng */
    @Id
    @Column(name = "content_id", nullable = false, updatable = false)
    private UUID contentId;

    @PrePersist
    public void generateId() {
        if (contentId == null) {
            contentId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * Người dùng tạo nội dung — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều GeneratedContent thuộc một User.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_gen_content_user"))
    private User user;

    /**
     * Giai đoạn lịch sử (HistoryPeriod).
     * Ví dụ: "Hy Lạp Cổ Đại", "Thời Kỳ Khai Sáng", "Thần Thoại Bắc Âu".
     */
    @Column(name = "history_period", nullable = false, length = 200)
    private String historyPeriod;

    /**
     * Nhân vật chính (CharacterName).
     * Tên nhân vật triết gia hoặc nhân vật lịch sử được chọn.
     */
    @Column(name = "character_name", nullable = false, length = 200)
    private String characterName;

    /**
     * Yêu cầu cụ thể từ người dùng (UserPrompt).
     * Nội dung tự do người dùng nhập vào biểu mẫu.
     */
    @Column(name = "user_prompt", columnDefinition = "TEXT", nullable = false)
    private String userPrompt;

    /**
     * Kịch bản tổng hợp (GeneratedScript).
     * Văn bản kịch bản do LLM sinh ra từ userPrompt.
     */
    @Column(name = "generated_script", columnDefinition = "TEXT")
    private String generatedScript;

    /**
     * Đường dẫn video (VideoUrl).
     * Sản phẩm sau khi render xong, dùng để phát trên Video Player.
     * Null nếu video chưa được render.
     */
    @Column(name = "video_url", length = 500)
    private String videoUrl;

    /**
     * Trạng thái lưu trữ vào Thư viện cá nhân (IsSavedToLibrary).
     * True → hiển thị trong Thư viện của người dùng.
     * Mặc định = false.
     */
    @Column(name = "is_saved_to_library", nullable = false)
    @Builder.Default
    private Boolean isSavedToLibrary = false;

//    /** Thời gian tạo — tự động gán khi persist */
//    @CreationTimestamp
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private Instant createdAt;
}
