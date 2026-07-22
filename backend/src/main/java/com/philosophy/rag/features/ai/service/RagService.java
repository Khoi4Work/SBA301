package com.philosophy.rag.features.ai.service;

import com.philosophy.rag.features.ai.dto.PageResponse;
import com.philosophy.rag.features.ai.dto.RagAskResponse;
import com.philosophy.rag.utils.dto.DocumentContent;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface RagService {
    String uploadDocument(MultipartFile file) throws Exception;

    RagAskResponse ask(UUID userId, String query, UUID philosopherId, UUID sessionId);

    RagAskResponse askContextual(UUID userId, String query, String s3Key, String selectedText, UUID philosopherId, UUID sessionId);

    /** Returns every chunk row – kept for internal use / backward compat. */
    List<DocumentContent> listDocuments();

    /**
     * Returns a paginated view of distinct uploaded documents.
     * Each entry represents one source file, not an individual chunk.
     */
    PageResponse<DocumentContent> listDocumentsPaged(Pageable pageable);

    void resetVectorStore();

    void deleteDocumentBySource(String source);

    PageResponse<com.philosophy.rag.features.ai.dto.DocumentChunk> getDocumentChunksPaged(String source, Pageable pageable);

    String prompt(String prompt);
}
