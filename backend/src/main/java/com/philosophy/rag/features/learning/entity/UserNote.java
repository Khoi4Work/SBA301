package com.philosophy.rag.features.learning.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

/**
 * MongoDB Document: Ghi chú của người dùng (UserNote)
 * Lưu trữ đoạn text được đánh dấu (highlight) và nội dung ghi chú cá nhân của người dùng.
 */
@Document(collection = "user_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNote {

    @Id
    private UUID noteId;

    private UUID userId;

    private UUID documentId;

    private String documentS3Key;

    private String selectedText;

    private String noteText;

    private Instant createdAt;
}
