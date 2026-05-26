package com.philosophy.rag.base.aop.annotation;

import java.lang.annotation.*;

/**
 * Annotation đánh dấu method cần theo dõi hiệu năng (execution time).
 *
 * Khi thời gian thực thi vượt quá {@code thresholdMs}, hệ thống sẽ ghi log WARN.
 *
 * Ví dụ:
 * <pre>
 *   {@literal @}MonitorPerformance(thresholdMs = 2000, alertOnSlow = true)
 *   public String ask(String query) { ... }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface MonitorPerformance {

    /**
     * Ngưỡng thời gian (milliseconds) để phát cảnh báo slow method.
     * Mặc định: 1000ms (1 giây).
     */
    long thresholdMs() default 1000L;

    /**
     * Tên operation để hiển thị trong log (tuỳ chọn, rõ nghĩa hơn tên method).
     */
    String operationName() default "";

    /**
     * Có ghi log cảnh báo khi vượt ngưỡng không?
     * Mặc định: true.
     */
    boolean alertOnSlow() default true;
}
