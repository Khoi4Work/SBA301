package com.philosophy.rag.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.response.CloudinaryUploadResponse;
import com.philosophy.rag.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @Operation(summary = "Upload an image to Cloudinary")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CloudinaryUploadResponse>> uploadImage(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "philosophy/images") String folder) throws ApiException {

        log.info("Received request to upload image: {}", file.getOriginalFilename());
        CloudinaryUploadResponse response = cloudinaryService.uploadImage(file, folder);
        return ResponseEntity.ok(ApiResponse.success(response, "Image uploaded successfully"));
    }

    @Operation(summary = "Delete an image from Cloudinary by public ID")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @RequestParam("publicId") String publicId) throws ApiException {

        log.info("Received request to delete image with public ID: {}", publicId);
        cloudinaryService.deleteImage(publicId);
        return ResponseEntity.ok(ApiResponse.success(null, "Image deleted successfully"));
    }
}
