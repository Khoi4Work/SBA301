package com.philosophy.rag.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Thực thể: Triết gia (Philosopher)
 * Quản lý thông tin định danh của các triết gia dùng làm dữ liệu cấu hình
 * cho phòng chat và hiển thị danh sách thẻ bài.
 */
@Entity
@Table(name = "philosophers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Philosopher extends BaseEntity {

    /** Mã triết gia — Khóa chính, tự tăng */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "philosopher_id")
    private UUID philosopherId;

    /** Tên triết gia */
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    /**
     * Ảnh đại diện (AvatarUrl).
     * Đường dẫn ảnh 2D hoặc 3D hiển thị trong phòng chat và thẻ bài.
     */
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    /**
     * Trích dẫn ngắn (ShortQuote).
     * Hiển thị trên thẻ bài ngoài màn hình chọn triết gia.
     */
    @Column(name = "short_quote", length = 500)
    private String shortQuote;

    /** Tiểu sử tóm tắt */
    @Column(name = "biography", columnDefinition = "TEXT")
    private String biography;

    /**
     * Prompt hệ thống (SystemPrompt).
     * Cấu hình để LLM nhập vai chính xác nhân vật triết gia.
     * Lưu dưới dạng TEXT vì nội dung thường dài.
     */
    @Column(name = "system_prompt", columnDefinition = "TEXT", nullable = false)
    private String systemPrompt;

    // ── Quan hệ 1-Nhiều ───────────────────────────────────────────────────────

    /** Danh sách tin nhắn hội thoại mà triết gia này tham gia */
    @OneToMany(mappedBy = "philosopher", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChatMessage> chatMessages = new ArrayList<>();
}
