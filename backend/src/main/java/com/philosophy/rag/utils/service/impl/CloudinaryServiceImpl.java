package com.philosophy.rag.utils.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.utils.dto.UploadResponse;
import com.philosophy.rag.utils.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements MediaStorageService {

    private final Cloudinary cloudinary;

    @Override
    public UploadResponse uploadImage(MultipartFile file) throws ApiException {
        return uploadImage(file, "philosophy/images");
    }

    @Override
    public UploadResponse uploadImage(MultipartFile file, String folder) throws ApiException {
        if (file == null || file.isEmpty()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "File must not be empty or null");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException(ErrorCode.UNSUPPORTED_MEDIA_TYPE, "Only image files are allowed");
        }

        try {
            Map<?, ?> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"
            );

            log.info("Uploading file {} to Cloudinary folder {}", file.getOriginalFilename(), folder);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            log.info("Cloudinary upload successful for file: {}", file.getOriginalFilename());

            return UploadResponse.builder()
                    .publicId((String) uploadResult.get("public_id"))
                    .url((String) uploadResult.get("url"))
                    .secureUrl((String) uploadResult.get("secure_url"))
                    .fileName(file.getOriginalFilename())
                    .format((String) uploadResult.get("format"))
                    .resourceType((String) uploadResult.get("resource_type"))
                    .bytes(uploadResult.get("bytes") != null ? ((Number) uploadResult.get("bytes")).longValue() : 0L)
                    .createdAt((String) uploadResult.get("created_at"))
                    .build();

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Failed to upload image: " + e.getMessage());
        }
    }

    @Override
    public void deleteImage(String publicId) throws ApiException {
        if (publicId == null || publicId.isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Public ID must not be empty");
        }

        try {
            log.info("Deleting image with publicId {} from Cloudinary", publicId);
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("result");
            if (!"ok".equals(resultStatus) && !"not_found".equals(resultStatus)) {
                log.warn("Cloudinary delete result for {}: {}", publicId, resultStatus);
            }
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary", e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Failed to delete image: " + e.getMessage());
        }
    }
}
