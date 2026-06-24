package com.philosophy.rag.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * MongoDB Document: Lịch sử làm bài (UserQuizResult)
 * Ghi nhận kết quả mỗi lần người dùng thực hiện thử thách.
 * Tự động xóa sau 30 ngày (TTL).
 */
@Document(collection = "user_quiz_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuizResult {

    /** Mã kết quả — Khóa chính */
    @Id
    private UUID resultId;

    /** ID người dùng làm bài */
    private UUID userId;

    /** ID bộ đề ôn tập */
    private UUID quizSetId;

    /** ID của lượt nộp bài (group các câu hỏi cùng lượt) */
    private UUID submissionId;

    /** Tiêu đề bộ đề ôn tập */
    private String quizSetTitle;

    /** Tiêu đề tài liệu liên quan */
    private String documentTitle;

    /** ID câu hỏi được trả lời */
    private UUID quizId;

    /** Trạng thái trả lời đúng hay sai */
    private Boolean isCorrectAnswer;

    // --- Các thông tin câu trả lời của người dùng ---
    
    /** Option được chọn (Multiple choice, True/False, Scenario) */
    private UUID selectedOptionId;

    /** Nội dung điền vào chỗ trống */
    private String blankText;

    /** Danh sách các cặp ghép nối (Matching) */
    private List<MongoMatchingPair> matches;

    /** Thứ tự các option được sắp xếp (Timeline) */
    private List<UUID> orderedOptionIds;

    /** Thời gian hoàn thành bài làm - tự động xóa sau 30 ngày (2,592,000 giây) */
    @Indexed(expireAfterSeconds = 2592000)
    private Instant completedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MongoMatchingPair {
        private String left;
        private String right;
    }
}
