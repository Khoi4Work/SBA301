package com.philosophy.rag.features.ai.repository;

import com.philosophy.rag.features.ai.entity.Philosopher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhilosopherRepository extends JpaRepository<Philosopher, UUID> {

    Optional<Philosopher> findFirstByNameContainingIgnoreCase(String name);

    boolean existsByName(String name);
    boolean existsByAvatarUrl(String avatarUrl);
    boolean existsByIdleModelUrl(String idleModelUrl);
    boolean existsByTalkingModelUrl(String talkingModelUrl);
    boolean existsByThinkingModelUrl(String thinkingModelUrl);

    Optional<Philosopher> findByName(String name);
    Optional<Philosopher> findByAvatarUrl(String avatarUrl);
    Optional<Philosopher> findByIdleModelUrl(String idleModelUrl);
    Optional<Philosopher> findByTalkingModelUrl(String talkingModelUrl);
    Optional<Philosopher> findByThinkingModelUrl(String thinkingModelUrl);
}
