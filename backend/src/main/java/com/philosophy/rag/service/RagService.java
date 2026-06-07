package com.philosophy.rag.service;

import com.philosophy.rag.dto.response.DocumentContent;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface RagService {
    String uploadDocument(MultipartFile file) throws Exception;

    String ask(String query, UUID philosopherId);

    List<DocumentContent> listDocuments();

    void resetVectorStore();

    String prompt(String prompt);
}
