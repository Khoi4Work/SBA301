package com.philosophy.rag.features.learning.repository;

import com.philosophy.rag.features.learning.entity.UserQuizSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserQuizSubmissionRepository extends MongoRepository<UserQuizSubmission, UUID> {
    List<UserQuizSubmission> findByUserId(UUID userId);
    void deleteByQuizSetId(UUID quizSetId);
}
