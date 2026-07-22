package com.philosophy.rag.features.learning.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.features.learning.dto.UserNoteRequest;
import com.philosophy.rag.features.learning.dto.UserNoteResponse;
import com.philosophy.rag.features.learning.entity.UserNote;
import com.philosophy.rag.features.learning.repository.UserNoteRepository;
import com.philosophy.rag.features.learning.service.UserNoteService;
import com.philosophy.rag.utils.entity.Document;
import com.philosophy.rag.utils.repository.DocumentRepository;
import com.github.f4b6a3.uuid.UuidCreator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserNoteServiceImpl implements UserNoteService {

    private final UserNoteRepository userNoteRepository;
    private final DocumentRepository documentRepository;

    @Override
    public UserNoteResponse createNote(UUID userId, UserNoteRequest request) {
        log.info("Creating note for user: {}, document: {}", userId, request.getDocumentS3Key());
        
        UUID docId = documentRepository.findByS3Key(request.getDocumentS3Key())
                .map(Document::getDocumentId)
                .orElse(null);

        UserNote note = UserNote.builder()
                .noteId(UuidCreator.getTimeOrderedEpoch())
                .userId(userId)
                .documentId(docId)
                .documentS3Key(request.getDocumentS3Key())
                .selectedText(request.getSelectedText())
                .noteText(request.getNoteText())
                .createdAt(Instant.now())
                .build();
        userNoteRepository.save(note);
        return toResponse(note);
    }

    @Override
    public List<UserNoteResponse> getNotesByDocument(UUID userId, String s3Key) {
        log.info("Fetching notes for user: {}, document: {}", userId, s3Key);
        List<UserNote> notes = userNoteRepository.findByUserIdAndDocumentS3Key(userId, s3Key);
        return notes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public UserNoteResponse updateNote(UUID userId, UUID noteId, UserNoteRequest request) {
        log.info("Updating note: {} for user: {}", noteId, userId);
        UserNote note = userNoteRepository.findById(noteId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ghi chú"));

        if (!note.getUserId().equals(userId)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, "Bạn không có quyền chỉnh sửa ghi chú này");
        }

        UUID docId = documentRepository.findByS3Key(request.getDocumentS3Key())
                .map(Document::getDocumentId)
                .orElse(null);

        note.setDocumentId(docId);
        note.setDocumentS3Key(request.getDocumentS3Key());
        note.setNoteText(request.getNoteText());
        note.setSelectedText(request.getSelectedText());
        userNoteRepository.save(note);
        return toResponse(note);
    }

    @Override
    public void deleteNote(UUID userId, UUID noteId) {
        log.info("Deleting note: {} for user: {}", noteId, userId);
        UserNote note = userNoteRepository.findById(noteId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ghi chú"));

        if (!note.getUserId().equals(userId)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, "Bạn không có quyền xóa ghi chú này");
        }

        userNoteRepository.delete(note);
    }

    private UserNoteResponse toResponse(UserNote note) {
        return UserNoteResponse.builder()
                .noteId(note.getNoteId())
                .documentId(note.getDocumentId())
                .documentS3Key(note.getDocumentS3Key())
                .selectedText(note.getSelectedText())
                .noteText(note.getNoteText())
                .createdAt(note.getCreatedAt())
                .build();
    }
}
