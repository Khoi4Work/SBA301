package com.philosophy.rag.base.aop.annotation;

import java.lang.annotation.*;

/**
 * Annotation đánh dấu method cần validation tầng AOP bổ sung,
 * ngoài Bean Validation ({@code @Valid} / {@code @NotBlank}) chuẩn.
 *
 * {@code ValidationAspect} sẽ kiểm tra:
 * - Tham số String không được blank.
 * - Tham số Object không được null.
 * - MultipartFile không được rỗng.
 * - Collection không được null/empty (nếu {@code rejectEmptyCollections = true}).
 *
 * Ví dụ:
 * <pre>
 *   {@literal @}ValidateInput(rejectEmptyCollections = true)
 *   public List{@literal <}Document{@literal >} processDocuments(List{@literal <}String{@literal >} ids) { ... }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ValidateInput {

    /**
     * Có từ chối Collection rỗng (size = 0) không?
     * Mặc định: false → chỉ kiểm tra null.
     */
    boolean rejectEmptyCollections() default false;

    /**
     * Có bỏ qua validation cho tham số null (cho phép Optional params)?
     * Mặc định: false → null luôn bị từ chối.
     */
    boolean allowNullParams() default false;
}
