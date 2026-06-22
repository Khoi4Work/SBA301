package com.philosophy.rag.repository.itf;

import com.philosophy.rag.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {

    /**
     * Lấy tất cả các phiên hội thoại của một người dùng.
     */
    List<ChatSession> findByUser_UserId(UUID userId);

    /**
     * Lấy các phiên hội thoại của một người dùng với một triết gia cụ thể.
     */
    List<ChatSession> findByUser_UserIdAndPhilosopher_PhilosopherId(UUID userId, UUID philosopherId);
}
