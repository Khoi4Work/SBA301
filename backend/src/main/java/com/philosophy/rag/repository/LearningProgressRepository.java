package com.philosophy.rag.repository;

import com.philosophy.rag.entity.LearningProgress;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, UUID> {
    Optional<LearningProgress> findByUserAndDocument(User user, Document document);
    long countByUserAndIsCompletedTrue(User user);
    List<LearningProgress> findByUser(User user);
}
