package com.philosophy.rag.base.aop.annotation;

import java.lang.annotation.*;

/**
 * Annotation bảo vệ method/endpoint — yêu cầu người dùng đã xác thực
 * và có đủ vai trò (roles) mới được thực thi.
 *
 * Được xử lý bởi {@code SecurityAspect}.
 *
 * Ví dụ:
 * <pre>
 *   // Chỉ cần đăng nhập
 *   {@literal @}RequiresRole
 *   public void listDocuments() { ... }
 *
 *   // Cần role ADMIN hoặc MODERATOR
 *   {@literal @}RequiresRole(roles = {"ADMIN", "MODERATOR"})
 *   public void resetDatabase() { ... }
 * </pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {

    /**
     * Danh sách vai trò được phép thực thi method.
     * Để rỗng → chỉ cần xác thực (authenticated), không cần role cụ thể.
     * Nhiều role → dùng logic OR (có ít nhất 1 role là đủ).
     */
    String[] roles() default {};

    /**
     * Mô tả lý do cần quyền này — dùng trong log để debug ACL.
     */
    String reason() default "";
}
