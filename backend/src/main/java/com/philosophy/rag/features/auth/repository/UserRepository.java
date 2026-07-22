package com.philosophy.rag.features.auth.repository;

import com.philosophy.rag.features.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT u.createdAt FROM User u WHERE u.createdAt >= :from ORDER BY u.createdAt ASC")
    List<LocalDateTime> findCreatedAtSince(@Param("from") LocalDateTime from);
}
