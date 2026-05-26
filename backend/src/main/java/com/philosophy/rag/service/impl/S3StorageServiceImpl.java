package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.dto.response.DocumentUploadResponse;
import com.philosophy.rag.service.S3StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.time.LocalDate;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3StorageServiceImpl implements S3StorageService {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String awsRegion;

    private final S3Client s3Client;

    @Override
    public DocumentUploadResponse uploadDocument(MultipartFile file, String title, String description) throws ApiException {
        log.info("Starting document upload: {}", file.getOriginalFilename());
        // Validate file rỗng
        if (file == null || file.isEmpty()) {
            log.warn("Empty file upload attempt");
            throw new ApiException(ErrorCode.INVALID_INPUT, "File cannot be empty");
        }

        // Validate tên file
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            log.warn("Invalid file name");
            throw new ApiException(ErrorCode.INVALID_INPUT, "File name is invalid");
        }

        // Clean file name để tránh lỗi khi lưu trữ
        String safeFileName = originalFileName.replaceAll("\\s+", "_");

        // Tạo key cho S3 với định dạng: documents/yyyy-MM-dd/uuid-filename
        String key = "documents/" + LocalDate.now() + "/" + UUID.randomUUID() + "-" + safeFileName;
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            // upload file lên S3
            try (var inputStream = file.getInputStream()) {
                s3Client.putObject(
                        putObjectRequest,
                        RequestBody.fromInputStream(inputStream, file.getSize())
                );
            }
            log.info("File uploaded to S3 successfully: bucket={}, key={}", bucketName, key);
        } catch (S3Exception e) {
            log.error("S3 upload error: {}", e.awsErrorDetails().errorMessage(), e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Failed to upload file to S3");
        } catch (Exception e) {
            log.error("File upload error: {}", e.getMessage(), e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "File upload failed: " + e.getMessage());
        }

        // tạo url để truy cập file đã upload
        String url = getS3Url(bucketName, awsRegion, key);

        return DocumentUploadResponse.builder()
                .title(title != null && !title.isBlank() ? title : originalFileName)
                .fileName(originalFileName)
                .bucket(bucketName)
                .key(key)
                .url(url)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .build();
    }

    // helper format S3 url
    private String getS3Url(String bucket, String region, String key) {
        return s3Client.utilities()
                .getUrl(builder -> builder.bucket(bucket).key(key))
                .toExternalForm();
    }
}