package com.philosophy.rag.features.learning.repository;

import com.philosophy.rag.features.learning.entity.QuizSet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizSetRepository extends MongoRepository<QuizSet, UUID> {
    List<QuizSet> findByDocumentS3Key(String s3Key);
}
