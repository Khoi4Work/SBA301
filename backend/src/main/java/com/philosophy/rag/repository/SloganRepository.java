package com.philosophy.rag.repository;

import com.philosophy.rag.entity.Slogan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SloganRepository extends JpaRepository<Slogan, UUID> {

    // Find the active slogan
    Optional<Slogan> findByIsActiveTrue();

    // Get a random slogan using native query
    @Query(value = "SELECT * FROM slogans ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Slogan findRandomSlogan();
}
