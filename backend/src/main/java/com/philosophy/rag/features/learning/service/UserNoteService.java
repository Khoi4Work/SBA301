package com.philosophy.rag.features.learning.service;

import com.philosophy.rag.features.learning.dto.UserNoteRequest;
import com.philosophy.rag.features.learning.dto.UserNoteResponse;

import java.util.List;
import java.util.UUID;

public interface UserNoteService {
    UserNoteResponse createNote(UUID userId, UserNoteRequest request);
    List<UserNoteResponse> getNotesByDocument(UUID userId, String s3Key);
    UserNoteResponse updateNote(UUID userId, UUID noteId, UserNoteRequest request);
    void deleteNote(UUID userId, UUID noteId);
}
