package com.philosophy.rag.utils.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.utils.dto.DocumentDistributionResponse;
import com.philosophy.rag.utils.dto.DocumentUploadResponse;
import com.philosophy.rag.utils.service.MediaStorageService;
import com.philosophy.rag.utils.service.S3StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.MetadataDirective;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3StorageServiceImpl implements S3StorageService {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String awsRegion;

    private final S3Client s3Client;
    private final MediaStorageService cloudinaryService;

    // In-memory cache for document metadata distribution response list
    private List<DocumentDistributionResponse> cachedDocumentList = null;
    private Instant cacheExpiry = Instant.MIN;
    private static final long CACHE_TTL_SECONDS = 300; // 5 minutes

    @Override
    public DocumentUploadResponse uploadDocument(MultipartFile file, String title, String description,
            MultipartFile image, String category)
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
        String asciiFileName = sanitizeFileName(safeFileName);

        // Tải ảnh bìa lên Cloudinary (nếu có file image truyền lên)
        String uploadedImageUrl = null;
        if (image != null && !image.isEmpty()) {
            try {
                log.info("Uploading cover image to Cloudinary for document: {}", originalFileName);
                uploadedImageUrl = cloudinaryService.uploadImage(image, "philosophy/documents").getSecureUrl();
            } catch (Exception e) {
                log.error("Failed to upload cover image to Cloudinary", e);
            }
        }

        // Tạo key cho S3 với định dạng: documents/yyyy-MM-dd/uuid-filename
        String key = "documents/" + LocalDate.now() + "/" + UUID.randomUUID() + "-" + asciiFileName;
        try {
            Map<String, String> metadata = new java.util.HashMap<>();

            // Mã hóa UTF-8 tiếng Việt cho các trường metadata
            String rawTitle = title != null && !title.isBlank() ? title : originalFileName;
            String rawDescription = description != null && !description.isBlank() ? description : "";
            String rawCategory = category != null && !category.isBlank() ? category : "";

            metadata.put("title", URLEncoder.encode(rawTitle, StandardCharsets.UTF_8.name()));
            metadata.put("description", URLEncoder.encode(rawDescription, StandardCharsets.UTF_8.name()));
            metadata.put("category", URLEncoder.encode(rawCategory, StandardCharsets.UTF_8.name()));
            metadata.put("original-file-name", URLEncoder.encode(originalFileName, StandardCharsets.UTF_8.name()));
            metadata.put("uploaded-at", LocalDate.now().toString());

            if (uploadedImageUrl != null && !uploadedImageUrl.isBlank()) {
                metadata.put("image-url", uploadedImageUrl);
            }

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

        // Invalidate cache on upload
        this.cachedDocumentList = null;
        this.cacheExpiry = Instant.MIN;

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
                .imageUrl(uploadedImageUrl)
                .category(category)
                .build();
    }

    @Override
    public List<DocumentDistributionResponse> listDocuments() throws ApiException {
        Instant now = Instant.now();
        if (cachedDocumentList != null && now.isBefore(cacheExpiry)) {
            log.info("Returning cached document list (size: {})", cachedDocumentList.size());
            return cachedDocumentList;
        }

        log.info("Cache miss or expired. Fetching document list from S3...");
        try {
            ListObjectsV2Response response = s3Client.listObjectsV2(ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix("documents/")
                    .build());

            List<DocumentDistributionResponse> documents = response.contents().stream()
                    .filter(object -> object.key() != null && !object.key().endsWith("/"))
                    .sorted((left, right) -> right.lastModified().compareTo(left.lastModified()))
                    .map(this::toDistributionResponse)
                    .toList();

            // Cache the results
            this.cachedDocumentList = documents;
            this.cacheExpiry = now.plusSeconds(CACHE_TTL_SECONDS);

            return documents;
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

            // Lấy và giải mã Tiếng Việt từ S3 User Metadata
            String rawFileName = metadata.get("original-file-name");
            String fileName = null;
            if (rawFileName != null) {
                try {
                    fileName = URLDecoder.decode(rawFileName, StandardCharsets.UTF_8.name());
                } catch (Exception e) {
                    // Ignore
                }
            }
            if (fileName == null || fileName.isBlank()) {
                fileName = extractFileNameFromKey(object.key());
            }

            String title = metadata.getOrDefault("title", fileName);
            try {
                title = URLDecoder.decode(title, StandardCharsets.UTF_8.name());
            } catch (Exception e) {
                // Giữ nguyên tiêu đề gốc nếu không thể giải mã
            }

            String description = metadata.getOrDefault("description", "");
            try {
                description = URLDecoder.decode(description, StandardCharsets.UTF_8.name());
            } catch (Exception e) {
                // Giữ nguyên mô tả gốc nếu không thể giải mã
            }

            String category = metadata.getOrDefault("category", "");
            try {
                category = URLDecoder.decode(category, StandardCharsets.UTF_8.name());
            } catch (Exception e) {
                // Giữ nguyên phân loại gốc nếu không thể giải mã
            }

            String imageUrl = metadata.get("image-url");

            return DocumentDistributionResponse.builder()
                    .title(title)
                    .description(description)
                    .fileName(fileName)
                    .bucket(bucketName)
                    .key(object.key())
                    .downloadUrl(null)
                    .fileSize(object.size())
                    .contentType(inferContentType(fileName))
                    .lastModified(object.lastModified() != null
                            ? object.lastModified().atZone(ZoneId.systemDefault())
                                    .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                            : null)
                    .imageUrl(imageUrl)
                    .category(category)
                    .build();
        } catch (Exception e) {
            log.warn("Unable to read metadata for S3 object {}: {}", object.key(), e.getMessage());
            String fileName = extractFileNameFromKey(object.key());
            return DocumentDistributionResponse.builder()
                    .title(fileName)
                    .description("")
                    .fileName(fileName)
                    .bucket(bucketName)
                    .key(object.key())
                    .downloadUrl(null)
                    .fileSize(object.size())
                    .contentType(inferContentType(fileName))
                    .lastModified(object.lastModified() != null
                            ? object.lastModified().atZone(ZoneId.systemDefault())
                                    .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                            : null)
                    .imageUrl(null)
                    .category("")
                    .build();
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

    @Override
    public byte[] downloadDocument(String key) throws ApiException {
        try {
            log.info("Downloading document from S3: bucket={}, key={}", bucketName, key);
            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build());
            return objectBytes.asByteArray();
        } catch (S3Exception e) {
            log.error("S3 download error: {}", e.awsErrorDetails().errorMessage(), e);
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Failed to download file from S3");
        } catch (Exception e) {
            log.error("File download error: {}", e.getMessage(), e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "File download failed: " + e.getMessage());
        }
    }

    @Override
    public String getContentType(String key) throws ApiException {
        try {
            HeadObjectResponse head = s3Client.headObject(
                    HeadObjectRequest.builder().bucket(bucketName).key(key).build());
            String ct = head.contentType();
            if (ct == null || ct.isBlank()) {
                return inferContentType(extractFileNameFromKey(key));
            }
            return ct;
        } catch (S3Exception e) {
            return "application/octet-stream";
        }
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null)
            return "document";
        // Normalize Vietnamese accents and remove them
        String normalized = Normalizer.normalize(fileName, Normalizer.Form.NFD);
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String ascii = pattern.matcher(normalized).replaceAll("");
        // Replace 'đ' and 'Đ'
        ascii = ascii.replace('đ', 'd').replace('Đ', 'D');
        // Replace non-alphanumeric (except dots, underscores, hyphens) with underscores
        ascii = ascii.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
        // Replace multiple underscores with a single underscore
        ascii = ascii.replaceAll("_+", "_");
        return ascii;
    }

    @Override
    public void deleteDocument(String key) throws ApiException {
        log.info("Deleting document from S3 with key: {}", key);
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
            log.info("Successfully deleted S3 object: {}", key);

            // Invalidate cache
            this.cachedDocumentList = null;
            this.cacheExpiry = Instant.MIN;
        } catch (S3Exception e) {
            log.error("Failed to delete S3 object: {}", e.awsErrorDetails().errorMessage(), e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Failed to delete file from S3");
        } catch (Exception e) {
            log.error("Unexpected error during S3 delete: {}", e.getMessage(), e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Delete failed: " + e.getMessage());
        }
    }

    @Override
    public void updateDocumentMetadata(String key, String title, String description, String category,
            MultipartFile newImage) throws ApiException {
        log.info("Updating metadata for S3 document: {}", key);
        try {
            // Get existing metadata first
            HeadObjectResponse headObject = s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
            Map<String, String> existingMetadata = headObject.metadata();
            Map<String, String> newMetadata = new java.util.HashMap<>(existingMetadata);

            if (title != null && !title.isBlank()) {
                newMetadata.put("title", URLEncoder.encode(title, StandardCharsets.UTF_8.name()));
            }
            if (description != null) {
                newMetadata.put("description", URLEncoder.encode(description, StandardCharsets.UTF_8.name()));
            }
            if (category != null && !category.isBlank()) {
                newMetadata.put("category", URLEncoder.encode(category, StandardCharsets.UTF_8.name()));
            }

            if (newImage != null && !newImage.isEmpty()) {
                log.info("Uploading new cover image to Cloudinary for key: {}", key);
                String uploadedImageUrl = cloudinaryService.uploadImage(newImage, "philosophy/documents")
                        .getSecureUrl();
                newMetadata.put("image-url", uploadedImageUrl);
            }

            s3Client.copyObject(CopyObjectRequest.builder()
                    .sourceBucket(bucketName)
                    .sourceKey(key)
                    .destinationBucket(bucketName)
                    .destinationKey(key)
                    .metadata(newMetadata)
                    .metadataDirective(MetadataDirective.REPLACE)
                    .build());

            log.info("Successfully updated S3 metadata for key: {}", key);

            // Invalidate cache
            this.cachedDocumentList = null;
            this.cacheExpiry = Instant.MIN;
        } catch (S3Exception e) {
            log.error("Failed to copy/update S3 metadata: {}", e.awsErrorDetails().errorMessage(), e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Failed to update S3 metadata");
        } catch (Exception e) {
            log.error("Unexpected error during S3 metadata update: {}", e.getMessage(), e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Update failed: " + e.getMessage());
        }
    }
}