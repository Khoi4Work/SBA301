package com.philosophy.rag.features.ai.repository;

import com.philosophy.rag.features.ai.entity.Philosopher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PhilosopherRepository extends JpaRepository<Philosopher, UUID> {
}
