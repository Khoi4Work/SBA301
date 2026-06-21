package com.philosophy.rag.service;

import com.philosophy.rag.entity.ChatSession;
import com.philosophy.rag.dto.response.ChatSessionResponse;

import java.util.List;
import java.util.UUID;

public interface ChatSessionService {

    /**
     * Tạo một phiên hội thoại mới.
     */
    ChatSession createSession(UUID userId, UUID philosopherId);

    /**
     * Lấy danh sách phiên hội thoại của người dùng.
     */
    List<ChatSessionResponse> listUserSessions(UUID userId);

    /**
     * Xóa một phiên hội thoại.
     */
    void deleteSession(UUID sessionId);

    /**
     * Cập nhật tiêu đề phiên hội thoại.
     */
    void updateSessionTitle(UUID sessionId, String title);
}
