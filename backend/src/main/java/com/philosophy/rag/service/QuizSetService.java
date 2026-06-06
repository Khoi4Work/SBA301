package com.philosophy.rag.service;

import com.philosophy.rag.dto.request.QuizSetGenerateRequest;
import com.philosophy.rag.dto.request.QuizSubmitRequest;
import com.philosophy.rag.dto.response.QuizSetDetailResponse;
import com.philosophy.rag.dto.response.QuizSetResponse;
import com.philosophy.rag.dto.response.QuizSubmitResponse;

import java.util.List;
import java.util.UUID;

public interface QuizSetService {
    List<QuizSetResponse> getQuizSets(String s3Key);
    QuizSetResponse generateQuizSet(QuizSetGenerateRequest request);
    QuizSetDetailResponse getQuizSetDetail(UUID quizSetId);
    QuizSubmitResponse gradeQuizSet(UUID quizSetId, QuizSubmitRequest request);
}
