package com.philosophy.rag.repository;

import com.philosophy.rag.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, UUID> {

    /**
     * Retrieve chat history for a user, sorted by newest first.
     */
    List<ChatHistory> findByUser_UserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Retrieve the most recent messages in a specific conversation session.
     */
    List<ChatHistory> findBySession_SessionIdOrderByCreatedAtAsc(UUID sessionId);

    @Query(value = "SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (max_end - min_start)) / 3600.0), 0) " +
                   "FROM ( " +
                   "    SELECT MIN(start_time) as min_start, MAX(end_time) as max_end " +
                   "    FROM chat_histories " +
                   "    WHERE user_id = :userId " +
                   "    GROUP BY session_id " +
                   ") as session_durations", nativeQuery = true)
    Double calculateTotalChatHours(@Param("userId") UUID userId);
}

