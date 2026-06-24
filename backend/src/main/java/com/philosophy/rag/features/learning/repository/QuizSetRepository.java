package com.philosophy.rag.features.learning.repository;

import com.philosophy.rag.features.learning.entity.QuizSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizSetRepository extends JpaRepository<QuizSet, UUID> {
    List<QuizSet> findByDocumentS3Key(String s3Key);
}
