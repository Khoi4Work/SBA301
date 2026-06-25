package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.dto.ChatHistoryResponse;
import com.philosophy.rag.features.ai.entity.ChatHistory;
import com.philosophy.rag.features.ai.entity.ChatSession;
import com.philosophy.rag.features.ai.entity.Philosopher;
import com.philosophy.rag.features.auth.entity.User;
import com.philosophy.rag.features.ai.repository.ChatHistoryRepository;
import com.philosophy.rag.features.ai.repository.ChatSessionRepository;
import com.philosophy.rag.features.ai.repository.PhilosopherRepository;
import com.philosophy.rag.features.auth.repository.UserRepository;
import com.philosophy.rag.features.ai.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatHistoryServiceImpl implements ChatHistoryService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;
    private final PhilosopherRepository philosopherRepository;

    @Override
    @Transactional
    public ChatHistory saveInteraction(UUID userId, UUID philosopherId, String query, String response, LocalDateTime start, LocalDateTime end, UUID sessionId) {
        log.info("Saving chat interaction for user: {}, philosopher: {}, session: {}", userId, philosopherId, sessionId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatSession session = null;
        if (sessionId != null) {
            session = chatSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        }

        long duration = Duration.between(start, end).toMillis();

        ChatHistory history = ChatHistory.builder()
                .user(user)
                .session(session)
                .query(query)
                .response(response)
                .startTime(start)
                .endTime(end)
                .durationMillis(duration)
                .build();

        return chatHistoryRepository.save(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatHistoryResponse> getUserHistory(UUID userId) {
        return chatHistoryRepository.findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatHistory> getRecentHistoryBySession(UUID sessionId, int limit) {
        List<ChatHistory> history = chatHistoryRepository.findBySession_SessionIdOrderByCreatedAtAsc(sessionId);
        int size = history.size();
        if (size <= limit) {
            return history;
        }
        return history.subList(size - limit, size);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatHistoryResponse> getHistoryBySession(UUID sessionId) {
        log.info("Fetching chat history for session: {}", sessionId);
        return chatHistoryRepository.findBySession_SessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ChatHistoryResponse toResponse(ChatHistory history) {
        Philosopher philosopher = (history.getSession() != null) ? history.getSession().getPhilosopher() : null;

        return ChatHistoryResponse.builder()
                .historyId(history.getHistoryId())
                .userId(history.getUser().getUserId())
                .philosopherId(philosopher != null ? philosopher.getPhilosopherId() : null)
                .philosopherName(philosopher != null ? philosopher.getName() : "AI")
                .query(history.getQuery())
                .response(history.getResponse())
                .startTime(history.getStartTime())
                .endTime(history.getEndTime())
                .durationMillis(history.getDurationMillis())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
