package com.philosophy.rag.features.ai.dto;

import java.util.List;

/**
 * DTO for paginated responses.
 * @param <T> The type of the content.
 */
public record PageResponse<T>(
    List<T> content,
    int currentPage,
    int totalPages,
    long totalElements
) {}
