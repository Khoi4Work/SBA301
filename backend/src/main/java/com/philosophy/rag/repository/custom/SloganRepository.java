package com.philosophy.rag.repository.custom;

import com.philosophy.rag.entity.Slogan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SloganRepository extends JpaRepository<Slogan, UUID> {

    // Nếu dùng cờ is_active
    Optional<Slogan> findByIsActiveTrue();

    // Hoặc nếu muốn lấy random bằng query native
    @Query(value = "SELECT * FROM slogans ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Slogan findRandomSlogan();
}
