package com.philosophy.rag.utils.service;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.utils.dto.DocumentDistributionResponse;
import com.philosophy.rag.utils.dto.DocumentUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface S3StorageService {
    DocumentUploadResponse uploadDocument(MultipartFile file, String title, String description, MultipartFile image, String category) throws ApiException;

    void deleteDocument(String key) throws ApiException;

    void updateDocumentMetadata(String key, String title, String description, String category, MultipartFile newImage) throws ApiException;

    List<DocumentDistributionResponse> listDocuments() throws ApiException;

    byte[] downloadDocument(String key) throws ApiException;

    String getContentType(String key) throws ApiException;
}