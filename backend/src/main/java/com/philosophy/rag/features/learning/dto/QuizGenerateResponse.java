package com.philosophy.rag.features.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizGenerateResponse {
    private String title;                    // Tên tài liệu
    private List<QuizQuestion> questions;    // 10 câu hỏi
}
