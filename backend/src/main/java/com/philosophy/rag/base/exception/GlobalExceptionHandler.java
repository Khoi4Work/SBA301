package com.philosophy.rag.base.exception;


import com.philosophy.rag.base.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.nio.file.AccessDeniedException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler for the entire application.
 * Returns unified ApiResponse format for all error scenarios.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(ApiException ex, HttpServletRequest request) {
        ErrorCode ec = ex.getErrorCode();
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec.getCode(), ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v ->
                errors.put(v.getPropertyPath().toString(), v.getMessage())
        );
        ErrorCode ec = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec.getCode(), ec.getDefaultMessage(), request.getRequestURI(), errors));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.put(fe.getField(), fe.getDefaultMessage());
        }
        ErrorCode ec = ErrorCode.VALIDATION_ERROR;
        ApiResponse<Object> body = buildError(ec.getCode(), ec.getDefaultMessage(), extractPath(request), errors);
        return new ResponseEntity<>(body, ec.getStatus());
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {
        ErrorCode ec = ErrorCode.MALFORMED_JSON;
        ApiResponse<Object> body = buildError(ec.getCode(), ec.getDefaultMessage(), extractPath(request), null);
        return new ResponseEntity<>(body, ec.getStatus());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        ErrorCode ec = ErrorCode.FORBIDDEN_ACTION;
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec.getCode(), ec.getDefaultMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("DataIntegrityViolation: {}", ex.getMessage());
        ErrorCode ec = ErrorCode.DUPLICATE_RESOURCE;
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec.getCode(), ec.getDefaultMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unexpected error:", ex);
        ErrorCode ec = ErrorCode.UNEXPECTED_ERROR;
        return ResponseEntity.status(ec.getStatus())
                .body(buildError(ec.getCode(), ec.getDefaultMessage(), request.getRequestURI(), null));
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        HttpStatus status = HttpStatus.resolve(statusCode.value());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorCode ec = mapErrorCode(status);
        ApiResponse<Object> resp = buildError(ec.getCode(), ec.getDefaultMessage(), extractPath(request), null);
        return new ResponseEntity<>(resp, headers, status);
    }

    @Override
    protected ResponseEntity<Object> handleNoResourceFoundException(NoResourceFoundException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return super.handleNoResourceFoundException(ex, headers, status, request);
    }

    // Helper: build error ApiResponse
    private ApiResponse<Object> buildError(int code, String message, String path, Map<String, String> errors) {
        return ApiResponse.<Object>builder()
                .code(code)
                .message(message)
                .result(null)
                .errors(errors)
                .timestamp(Instant.now())
                .path(path)
                .build();
    }

    // Helper: extract path from WebRequest
    private String extractPath(WebRequest request) {
        String desc = request.getDescription(false);
        if (desc == null) return null;
        return desc.startsWith("uri=") ? desc.substring(4) : desc;
    }

    private ErrorCode mapErrorCode(HttpStatus status) {
        return switch (status.value()) {
            case 400 -> ErrorCode.REQUEST_FAILED;
            case 401 -> ErrorCode.UNAUTHENTICATED;
            case 403 -> ErrorCode.FORBIDDEN_ACTION;
            case 404 -> ErrorCode.RESOURCE_NOT_FOUND;
            case 415 -> ErrorCode.UNSUPPORTED_MEDIA_TYPE;
            case 429 -> ErrorCode.TOO_MANY_REQUESTS;
            default -> status.is4xxClientError() ? ErrorCode.REQUEST_FAILED : ErrorCode.UNEXPECTED_ERROR;
        };
    }
}