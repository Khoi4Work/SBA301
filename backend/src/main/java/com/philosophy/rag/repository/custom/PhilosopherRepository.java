package com.philosophy.rag.repository.custom;

import com.philosophy.rag.entity.Philosopher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PhilosopherRepository extends JpaRepository<Philosopher, UUID> {
}
