package com.philosophy.rag.service;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.dto.DocumentDistributionResponse;
import com.philosophy.rag.dto.response.DocumentUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface S3StorageService {
    DocumentUploadResponse uploadDocument(MultipartFile file, String title, String description) throws ApiException;

    List<DocumentDistributionResponse> listDocuments() throws ApiException;

}