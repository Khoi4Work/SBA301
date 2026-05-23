package com.philosophy.rag.base.exception;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * Centralized error codes for the entire application.
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    SUCCESS(1000, "Success", HttpStatus.OK),

    // Auth errors
    INVALID_INFO(403, "Invalid login information", HttpStatus.BAD_REQUEST),
    INVALID_USER_ID(404, "Invalid user information", HttpStatus.BAD_REQUEST),

    // Validation errors (4xxx)
    VALIDATION_ERROR(4000, "Validation failed", HttpStatus.BAD_REQUEST),
    MALFORMED_JSON(4001, "Malformed JSON request", HttpStatus.BAD_REQUEST),
    INVALID_INPUT(4002, "Invalid input", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(4003, "OTP has expired", HttpStatus.BAD_REQUEST),
    OTP_INVALID(4004, "Invalid OTP", HttpStatus.BAD_REQUEST),
    VERIFY_TOKEN_EXPIRED(4005, "Verify token has expired", HttpStatus.BAD_REQUEST),
    VERIFY_TOKEN_INVALID(4006, "Invalid verify token", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(4008, "Invalid request", HttpStatus.BAD_REQUEST),

    // Security errors
    UNAUTHENTICATED(4010, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    FORBIDDEN_ACTION(4030, "Forbidden", HttpStatus.FORBIDDEN),

    // Resource errors
    RESOURCE_NOT_FOUND(4040, "Not found", HttpStatus.NOT_FOUND),
    ROLE_NOT_FOUND(4041, "Role not found", HttpStatus.NOT_FOUND),
    DUPLICATE_RESOURCE(4090, "Conflict, resource already exists", HttpStatus.CONFLICT),
    MONITOR_ALREADY_EXISTS(4091, "Admin account already exists", HttpStatus.CONFLICT),
    PHONE_NUMBER_EXISTS(4092, "Phone number already in use", HttpStatus.CONFLICT),
    PERMISSION_IN_USE(40901, "Permission in use", HttpStatus.CONFLICT),

    // Other client errors
    UNSUPPORTED_MEDIA_TYPE(4150, "Unsupported media type", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    TOO_MANY_REQUESTS(4290, "Too many requests", HttpStatus.TOO_MANY_REQUESTS),
    REQUEST_FAILED(4999, "Request failed", HttpStatus.BAD_REQUEST),

    // Engagement errors
    COUPON_USAGE_LIMIT_REACHED(4200, "Coupon usage limit reached", HttpStatus.BAD_REQUEST),
    COUPON_EXPIRED(4201, "Coupon has expired", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_POINTS(4202, "Insufficient reward points", HttpStatus.BAD_REQUEST),
    TIER_EVALUATION_FAILED(4203, "Tier evaluation failed", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_COUPON(4204, "Invalid coupon", HttpStatus.BAD_REQUEST),
    ORDER_CONDITION_NOT_MET(4205, "Order does not meet coupon conditions", HttpStatus.BAD_REQUEST),

    // Server errors
    UNEXPECTED_ERROR(5000, "Unexpected error", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_SEND_FAILED(5001, "Failed to send OTP email", HttpStatus.INTERNAL_SERVER_ERROR),
    RAG_SERVICE_ERROR(5002, "RAG service error occurred", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String defaultMessage;
    private final HttpStatus status;
}
