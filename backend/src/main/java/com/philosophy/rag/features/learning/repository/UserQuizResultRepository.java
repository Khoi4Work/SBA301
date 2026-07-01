package com.philosophy.rag.features.learning.repository;

import com.philosophy.rag.features.learning.entity.UserQuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserQuizResultRepository extends MongoRepository<UserQuizResult, UUID> {
    List<UserQuizResult> findByUserId(UUID userId);

    List<UserQuizResult> findBySubmissionId(UUID submissionId);

    void deleteByQuizSetId(UUID quizSetId);
}
