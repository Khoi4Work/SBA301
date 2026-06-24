package com.philosophy.rag.utils.service;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.utils.dto.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    UploadResponse uploadImage(MultipartFile file) throws ApiException;
    UploadResponse uploadImage(MultipartFile file, String folder) throws ApiException;
    void deleteImage(String publicId) throws ApiException;
}


