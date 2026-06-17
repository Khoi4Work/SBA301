package com.philosophy.rag.service;

import com.philosophy.rag.dto.response.ChatHistoryResponse;
import com.philosophy.rag.entity.ChatHistory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ChatHistoryService {

    /**
     * Lưu thông tin một lượt tương tác vào lịch sử.
     */
    ChatHistory saveInteraction(UUID userId, UUID philosopherId, String query, String response, LocalDateTime start, LocalDateTime end);

    /**
     * Lấy danh sách lịch sử trò chuyện của người dùng.
     */
    List<ChatHistoryResponse> getUserHistory(UUID userId);
}
