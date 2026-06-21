package com.philosophy.rag.service.impl;

import com.philosophy.rag.entity.ChatSession;
import com.philosophy.rag.entity.Philosopher;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.dto.response.ChatSessionResponse;
import com.philosophy.rag.repository.itf.ChatSessionRepository;
import com.philosophy.rag.repository.itf.PhilosopherRepository;
import com.philosophy.rag.repository.itf.UserRepository;
import com.philosophy.rag.service.ChatSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatSessionServiceImpl implements ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;
    private final PhilosopherRepository philosopherRepository;

    @Override
    @Transactional
    public ChatSession createSession(UUID userId, UUID philosopherId) {
        log.info("Creating new chat session for user: {}, philosopher: {}", userId, philosopherId);

        if (philosopherId == null) {
            throw new RuntimeException("Philosopher ID is required to create a session");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Philosopher philosopher = philosopherRepository.findById(philosopherId)
                .orElseThrow(() -> new RuntimeException("Philosopher not found"));

        ChatSession session = ChatSession.builder()
                .user(user)
                .philosopher(philosopher)
                .title("Cuộc hội thoại mới")
                .build();

        return chatSessionRepository.save(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionResponse> listUserSessions(UUID userId, UUID philosopherId) {
        List<ChatSession> sessions;
        if (philosopherId != null) {
            log.info("Fetching filtered chat sessions for user: {}, philosopher: {}", userId, philosopherId);
            sessions = chatSessionRepository.findByUser_UserIdAndPhilosopher_PhilosopherId(userId, philosopherId);
        } else {
            log.info("Fetching all chat sessions for user: {}", userId);
            sessions = chatSessionRepository.findByUser_UserId(userId);
        }

        return sessions.stream()
                .map(session -> ChatSessionResponse.builder()
                        .sessionId(session.getSessionId())
                        .title(session.getTitle())
                        .philosopherId(session.getPhilosopher() != null ? session.getPhilosopher().getPhilosopherId() : null)
                        .philosopherName(session.getPhilosopher() != null ? session.getPhilosopher().getName() : "Unknown")
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void deleteSession(UUID sessionId) {
        log.info("Deleting chat session: {}", sessionId);
        chatSessionRepository.deleteById(sessionId);
    }

    @Override
    @Transactional
    public void updateSessionTitle(UUID sessionId, String title) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setTitle(title);
        chatSessionRepository.save(session);
    }
}
