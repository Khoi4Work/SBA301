package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.response.ChatHistoryResponse;
import com.philosophy.rag.entity.ChatHistory;
import com.philosophy.rag.entity.Philosopher;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.itf.ChatHistoryRepository;
import com.philosophy.rag.repository.itf.PhilosopherRepository;
import com.philosophy.rag.repository.itf.UserRepository;
import com.philosophy.rag.service.ChatHistoryService;
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
    private final UserRepository userRepository;
    private final PhilosopherRepository philosopherRepository;

    @Override
    @Transactional
    public ChatHistory saveInteraction(UUID userId, UUID philosopherId, String query, String response, LocalDateTime start, LocalDateTime end) {
        log.info("Saving chat interaction for user: {}, philosopher: {}", userId, philosopherId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Philosopher philosopher = null;
        if (philosopherId != null) {
            philosopher = philosopherRepository.findById(philosopherId).orElse(null);
        }

        long duration = Duration.between(start, end).toMillis();

        ChatHistory history = ChatHistory.builder()
                .user(user)
                .philosopher(philosopher)
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

    private ChatHistoryResponse toResponse(ChatHistory history) {
        return ChatHistoryResponse.builder()
                .historyId(history.getHistoryId())
                .userId(history.getUser().getUserId())
                .philosopherId(history.getPhilosopher() != null ? history.getPhilosopher().getPhilosopherId() : null)
                .philosopherName(history.getPhilosopher() != null ? history.getPhilosopher().getName() : "AI")
                .query(history.getQuery())
                .response(history.getResponse())
                .startTime(history.getStartTime())
                .endTime(history.getEndTime())
                .durationMillis(history.getDurationMillis())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
