package com.philosophy.rag.service;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.dto.response.CloudinaryUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    CloudinaryUploadResponse uploadImage(MultipartFile file) throws ApiException;
    CloudinaryUploadResponse uploadImage(MultipartFile file, String folder) throws ApiException;
    void deleteImage(String publicId) throws ApiException;
}
