package com.philosophy.rag.repository;

import com.philosophy.rag.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {

    /**
     * Retrieve all conversation sessions for a user.
     */
    List<ChatSession> findByUser_UserId(UUID userId);

    /**
     * Retrieve conversation sessions for a user with a specific philosopher.
     */
    List<ChatSession> findByUser_UserIdAndPhilosopher_PhilosopherId(UUID userId, UUID philosopherId);
}
