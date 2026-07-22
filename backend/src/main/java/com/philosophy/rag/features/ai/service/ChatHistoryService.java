package com.philosophy.rag.features.ai.service;

import com.philosophy.rag.features.ai.dto.ChatHistoryResponse;
import com.philosophy.rag.features.ai.entity.ChatHistory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ChatHistoryService {

    /**
     * Lưu thông tin một lượt tương tác vào lịch sử, gắn với một phiên hội thoại.
     */
    ChatHistory saveInteraction(UUID userId, UUID philosopherId, String query, String response, LocalDateTime start, LocalDateTime end, UUID sessionId);

    /**
     * Lấy danh sách lịch sử trò chuyện của người dùng.
     */
    List<ChatHistoryResponse> getUserHistory(UUID userId);

    /**
     * Lấy N lượt tương tác gần nhất của một phiên hội thoại để làm ngữ cảnh.
     */
    List<ChatHistory> getRecentHistoryBySession(UUID sessionId, int limit);

    /**
     * Lấy toàn bộ lịch sử trò chuyện của một phiên hội thoại.
     */
    List<ChatHistoryResponse> getHistoryBySession(UUID sessionId);
}
