package com.philosophy.rag.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {
    private int index;               // Số thứ tự (1-10)
    private String question;         // Câu hỏi
    private List<String> options;    // 4 lựa chọn [A, B, C, D]
    private int correctIndex;        // Index của đáp án đúng (0-3)
    private String explanation;      // Giải thích đáp án
}
