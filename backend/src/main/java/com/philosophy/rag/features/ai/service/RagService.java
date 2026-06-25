package com.philosophy.rag.features.ai.service;


import com.philosophy.rag.features.ai.dto.RagAskResponse;
import com.philosophy.rag.utils.dto.DocumentContent;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface RagService {
    String uploadDocument(MultipartFile file) throws Exception;

    RagAskResponse ask(UUID userId, String query, UUID philosopherId, UUID sessionId);

    RagAskResponse askContextual(UUID userId, String query, String s3Key, String selectedText, UUID philosopherId, UUID sessionId);

    List<DocumentContent> listDocuments();

    void resetVectorStore();

    String prompt(String prompt);
}
