package com.philosophy.rag.service;

import com.philosophy.rag.dto.response.DocumentContent;
import com.philosophy.rag.dto.response.RagAskResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface RagService {
    String uploadDocument(MultipartFile file) throws Exception;

    RagAskResponse ask(UUID userId, String query, UUID philosopherId, UUID sessionId);

    List<DocumentContent> listDocuments();

    void resetVectorStore();

    String prompt(String prompt);
}
