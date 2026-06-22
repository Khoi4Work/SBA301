package com.philosophy.rag.repository;

import com.philosophy.rag.entity.UserQuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface UserQuizResultRepository extends JpaRepository<UserQuizResult, UUID> {
}
