package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.dto.response.DocumentDistributionResponse;
import com.philosophy.rag.dto.response.DocumentUploadResponse;
import com.philosophy.rag.service.S3StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Profile("!dev")
public class S3StorageServiceImpl implements S3StorageService {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String awsRegion;

    private final S3Client s3Client;

    @Override
    public DocumentUploadResponse uploadDocument(MultipartFile file, String title, String description)
            throws ApiException {
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
            Map<String, String> metadata = Map.of(
                    "title", title != null && !title.isBlank() ? title : originalFileName,
                    "description", description != null && !description.isBlank() ? description : "",
                    "original-file-name", originalFileName,
                    "uploaded-at", LocalDate.now().toString());

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .metadata(metadata)
                    .build();

            // upload file lên S3
            try (var inputStream = file.getInputStream()) {
                s3Client.putObject(
                        putObjectRequest,
                        RequestBody.fromInputStream(inputStream, file.getSize()));
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

    @Override
    public List<DocumentDistributionResponse> listDocuments() throws ApiException {
        try {
            ListObjectsV2Response response = s3Client.listObjectsV2(ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix("documents/")
                    .build());

            return response.contents().stream()
                    .filter(object -> object.key() != null && !object.key().endsWith("/"))
                    .sorted((left, right) -> right.lastModified().compareTo(left.lastModified()))
                    .map(this::toDistributionResponse)
                    .toList();
        } catch (S3Exception e) {
            log.error("Failed to list S3 documents: {}", e.awsErrorDetails().errorMessage(), e);
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Failed to list documents from S3");
        } catch (Exception e) {
            log.error("Unexpected error while listing S3 documents: {}", e.getMessage(), e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Unexpected error while listing documents");
        }
    }

    // helper format S3 url
    private String getS3Url(String bucket, String region, String key) {
        return s3Client.utilities()
                .getUrl(builder -> builder.bucket(bucket).key(key))
                .toExternalForm();
    }

    private DocumentDistributionResponse toDistributionResponse(S3Object object) {
        try {
            HeadObjectResponse headObject = s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(object.key())
                    .build());

            Map<String, String> metadata = headObject.metadata();
            String fileName = extractFileNameFromKey(object.key());
            String title = metadata.getOrDefault("title", fileName);
            String description = metadata.getOrDefault("description", "");

            return new DocumentDistributionResponse(
                    title,
                    description,
                    fileName,
                    bucketName,
                    object.key(),
                    null,
                    object.size(),
                    inferContentType(fileName),
                    object.lastModified() != null
                            ? object.lastModified().atZone(ZoneId.systemDefault())
                                    .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                            : null);
        } catch (Exception e) {
            log.warn("Unable to read metadata for S3 object {}: {}", object.key(), e.getMessage());
            String fileName = extractFileNameFromKey(object.key());
            return new DocumentDistributionResponse(
                    fileName,
                    "",
                    fileName,
                    bucketName,
                    object.key(),
                    null,
                    object.size(),
                    inferContentType(fileName),
                    object.lastModified() != null
                            ? object.lastModified().atZone(ZoneId.systemDefault())
                                    .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                            : null);
        }
    }

    private String extractFileNameFromKey(String key) {
        String fileName = key.substring(key.lastIndexOf('/') + 1);
        if (fileName.length() > 37 && fileName.charAt(36) == '-') {
            return fileName.substring(37);
        }
        return fileName;
    }

    private String inferContentType(String fileName) {
        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".pdf")) {
            return "application/pdf";
        }
        if (lowerName.endsWith(".md") || lowerName.endsWith(".markdown")) {
            return "text/markdown";
        }
        if (lowerName.endsWith(".txt")) {
            return "text/plain";
        }
        return "application/octet-stream";
    }
}