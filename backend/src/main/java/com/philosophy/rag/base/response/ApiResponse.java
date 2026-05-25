package com.philosophy.rag.base.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Unified API response wrapper for all REST endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private int code = 1000;

    private String message;
    private T result;
    private Map<String, String> errors;
    private Instant timestamp = Instant.now();
    private String path;

    public static <T> ApiResponse<T> success(T result) {
        return ApiResponse.<T>builder()
                .code(1000)
                .message("Success")
                .result(result)
                .build();
    }

    public static <T> ApiResponse<T> success(T result, String message) {
        return ApiResponse.<T>builder()
                .code(1000)
                .message(message)
                .result(result)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message, Map<String, String> errors) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .errors(errors)
                .build();
    }
}