package com.philosophy.rag.features.learning.service;

import com.philosophy.rag.features.learning.dto.QuizSetGenerateRequest;
import com.philosophy.rag.features.learning.dto.QuizSubmitRequest;
import com.philosophy.rag.features.learning.dto.QuizSetDetailResponse;
import com.philosophy.rag.features.learning.dto.QuizSetResponse;
import com.philosophy.rag.features.learning.dto.QuizSubmitResponse;

import com.philosophy.rag.features.learning.dto.QuizHistoryResponse;
import com.philosophy.rag.features.learning.dto.QuizSubmissionDetailResponse;

import java.util.List;
import java.util.UUID;

public interface QuizSetService {
    List<QuizSetResponse> getQuizSets(String s3Key);
    QuizSetResponse generateQuizSet(QuizSetGenerateRequest request);
    QuizSetDetailResponse getQuizSetDetail(UUID quizSetId);
    QuizSubmitResponse gradeQuizSet(UUID quizSetId, QuizSubmitRequest request);
    List<QuizHistoryResponse> getQuizHistory();
    QuizSubmissionDetailResponse getQuizSubmissionDetail(UUID submissionId);
}
