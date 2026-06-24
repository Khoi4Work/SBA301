package com.philosophy.rag.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * MongoDB Document: Bộ đề ôn tập (QuizSet)
 * Nhóm các câu hỏi ôn tập (thường gồm 20 câu hỏi) thuộc về một tài liệu nhất định.
 * Tự động xóa sau 30 ngày (TTL).
 */
@Document(collection = "quiz_sets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSet {

    /** Mã bộ đề — Khóa chính */
    @Id
    private UUID quizSetId;

    /** Tiêu đề bộ đề ôn tập */
    private String title;

    /** ID tài liệu liên quan */
    private UUID documentId;

    /** Tiêu đề tài liệu liên quan */
    private String documentTitle;

    /** S3 Key của tài liệu liên quan (dùng để tìm bộ đề ôn tập) */
    private String documentS3Key;

    /** Danh sách câu hỏi trong bộ đề này (Embedded Document) */
    @Builder.Default
    private List<Quiz> quizzes = new ArrayList<>();

    /** Thời gian tạo bộ đề - tự động xóa sau 30 ngày (2,592,000 giây) */
    @Indexed(expireAfterSeconds = 2592000)
    private Instant createdAt;
}
