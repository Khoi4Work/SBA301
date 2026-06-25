package com.philosophy.rag.features.learning.repository;

import com.philosophy.rag.features.learning.entity.UserNote;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserNoteRepository extends MongoRepository<UserNote, UUID> {
    List<UserNote> findByUserIdAndDocumentS3Key(UUID userId, String s3Key);
    List<UserNote> findByUserId(UUID userId);
}
