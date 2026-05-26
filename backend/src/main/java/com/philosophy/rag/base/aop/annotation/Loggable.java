package com.philosophy.rag.base.aop.annotation;

import java.lang.annotation.*;

/**
 * Annotation đánh dấu method/class cần ghi log chi tiết.
 *
 * Khi đặt lên class → toàn bộ public method của class đó được log.
 * Khi đặt lên method → chỉ method đó được log.
 *
 * Ví dụ:
 * <pre>
 *   {@literal @}Loggable
 *   public String ask(String query) { ... }
 * </pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Loggable {

    /**
     * Có log tham số đầu vào không?
     * Mặc định: true. Tắt nếu tham số chứa dữ liệu nhạy cảm.
     */
    boolean logArgs() default true;

    /**
     * Có log giá trị trả về không?
     * Mặc định: true. Tắt nếu response quá lớn (e.g., full text documents).
     */
    boolean logResult() default true;
}
