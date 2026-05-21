package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.DocumentContent;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RagServiceImpl {
    String uploadDocument(MultipartFile file) throws Exception;

    String ask(String query);

    List<DocumentContent> listDocuments();

    void resetVectorStore();
}
