package com.philosophy.rag.utils.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.response.ApiResult;
import com.philosophy.rag.utils.dto.UploadResponse;
import com.philosophy.rag.utils.service.MediaStorageService;
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

    private final MediaStorageService cloudinaryService;

    @Operation(summary = "Upload an image to Cloudinary")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<UploadResponse>> uploadImage(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "philosophy/images") String folder) throws ApiException {

        log.info("Received request to upload image: {}", file.getOriginalFilename());
        UploadResponse response = cloudinaryService.uploadImage(file, folder);
        return ResponseEntity.ok(ApiResult.success(response, "Image uploaded successfully"));
    }
//
//    @Operation(summary = "Upload a 3D model (.glb) to Cloudinary")
//    @PostMapping(value = "/model", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<ApiResult<UploadResponse>> uploadModel(
//            @RequestPart("file") MultipartFile file,
//            @RequestParam(value = "folder", defaultValue = "philosophy/models") String folder) throws ApiException {
//
//        log.info("Received request to upload 3D model: {}", file.getOriginalFilename());
//        UploadResponse response = cloudinaryService.uploadModel(file, folder);
//        return ResponseEntity.ok(ApiResult.success(response, "Model uploaded successfully"));
//    }

    @Operation(summary = "Delete an image from Cloudinary by public ID")
    @DeleteMapping
    public ResponseEntity<ApiResult<Void>> deleteImage(
            @RequestParam("publicId") String publicId) throws ApiException {

        log.info("Received request to delete image with public ID: {}", publicId);
        cloudinaryService.deleteImage(publicId);
        return ResponseEntity.ok(ApiResult.success(null, "Image deleted successfully"));
    }
}
