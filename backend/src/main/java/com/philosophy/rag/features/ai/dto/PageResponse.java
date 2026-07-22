package com.philosophy.rag.features.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Generic paginated response DTO.
 * <p>
 * Wraps a Spring {@link Page} and exposes all metadata required by the frontend:
 * content list, current page index, page size, total elements, total pages,
 * and convenience booleans for navigation.
 *
 * @param <T> the type of elements in the page
 */
public record PageResponse<T>(
        List<T>  content,
        int      page,
        int      size,
        long     totalElements,
        int      totalPages,
        @JsonProperty("first")       boolean first,
        @JsonProperty("last")        boolean last,
        @JsonProperty("hasNext")     boolean hasNext,
        @JsonProperty("hasPrevious") boolean hasPrevious
) {
    /**
     * Convenience factory: creates a {@code PageResponse<T>} from a Spring {@link Page}.
     */
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.hasNext(),
                page.hasPrevious()
        );
    }

    /**
     * Convenience factory: creates a {@code PageResponse<R>} from a Spring {@link Page}
     * but replaces the content with the provided list.
     * Useful when the DTO elements differ from the entity elements.
     */
    public static <R, T> PageResponse<R> from(Page<T> page, List<R> content) {
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.hasNext(),
                page.hasPrevious()
        );
    }
}
