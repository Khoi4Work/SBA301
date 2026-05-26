package com.philosophy.rag.service;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.dto.response.DocumentUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface S3StorageService {
    DocumentUploadResponse uploadDocument(MultipartFile file, String title, String description) throws ApiException;
}