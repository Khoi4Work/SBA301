package com.philosophy.rag.repository.itf;

import com.philosophy.rag.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, UUID> {

    /**
     * Lấy danh sách lịch sử trò chuyện của một người dùng, sắp xếp mới nhất trước.
     */
    List<ChatHistory> findByUser_UserIdOrderByCreatedAtDesc(UUID userId);
}
