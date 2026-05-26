package com.philosophy.rag.service;

import com.philosophy.rag.dto.response.DocumentContent;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RagService {
    String uploadDocument(MultipartFile file) throws Exception;

    String ask(String query);

    List<DocumentContent> listDocuments();

    void resetVectorStore();
}
