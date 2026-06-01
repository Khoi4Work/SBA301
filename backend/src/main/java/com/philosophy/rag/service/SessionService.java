package com.philosophy.rag.service;

import com.philosophy.rag.dto.response.QuizGenerateResponse;
import com.philosophy.rag.dto.response.SessionContentResponse;

public interface SessionService {
    /**
     * Download file từ S3 theo key, extract text (PDF/DOCX/MD/TXT), trả về content
     */
    SessionContentResponse getContent(String s3Key);

    /**
     * Dựa vào content của file, dùng AI sinh 10 câu quiz tiếng Việt
     */
    QuizGenerateResponse generateQuiz(String s3Key);
}
