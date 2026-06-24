package com.philosophy.rag.features.learning.repository;

import com.philosophy.rag.features.learning.entity.UserQuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface UserQuizResultRepository extends JpaRepository<UserQuizResult, UUID> {
}
