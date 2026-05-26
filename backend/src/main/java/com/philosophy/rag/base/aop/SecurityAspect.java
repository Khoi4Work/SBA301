package com.philosophy.rag.base.aop;

import com.philosophy.rag.base.aop.annotation.RequiresRole;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  ASPECT 2: SECURITY                                      ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  Kiểm tra xác thực và phân quyền tại tầng AOP:          ║
 * ║                                                          ║
 * ║  • @RequiresRole         → Kiểm tra role cụ thể          ║
 * ║  • Tự động log audit     → ai gọi method nào lúc mấy giờ ║
 * ║  • Phát hiện truy cập    → unauthenticated request       ║
 * ║    trái phép sớm                                         ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@Slf4j
@Aspect
@Component
public class SecurityAspect {

    // ──────────────────────────────────────────────────────────────────────────
    // POINTCUT DEFINITIONS
    // ──────────────────────────────────────────────────────────────────────────

    /** Method hoặc class được đánh dấu @RequiresRole */
    @Pointcut("@annotation(com.philosophy.rag.base.aop.annotation.RequiresRole) " +
              "|| @within(com.philosophy.rag.base.aop.annotation.RequiresRole)")
    public void requiresRoleAnnotated() {}

    /** Tất cả method ở tầng controller (audit log) */
    @Pointcut("within(com.philosophy.rag.controller..*)")
    public void controllerLayer() {}

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 1: KIỂM TRA ROLE TỪ @RequiresRole
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Before — Chạy trước mọi method có @RequiresRole.
     * Luồng kiểm tra:
     *   1. Lấy Authentication từ SecurityContext
     *   2. Kiểm tra isAuthenticated()
     *   3. Nếu roles[] không rỗng → kiểm tra giao nhau với authorities
     *   4. Nếu không đủ quyền → ném ApiException(FORBIDDEN_ACTION)
     */
    @Before("requiresRoleAnnotated()")
    public void checkRoleAccess(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        // Lấy annotation @RequiresRole (ưu tiên method, sau đó class)
        RequiresRole requiresRole = method.getAnnotation(RequiresRole.class);
        if (requiresRole == null) {
            requiresRole = method.getDeclaringClass().getAnnotation(RequiresRole.class);
        }
        if (requiresRole == null) return;

        String className  = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = method.getName();
        String reason     = requiresRole.reason().isEmpty()
                          ? "no reason provided"
                          : requiresRole.reason();

        // Bước 1: Lấy Authentication hiện tại
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Bước 2: Kiểm tra đã xác thực chưa
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            log.warn("[SECURITY] UNAUTHENTICATED access attempt to {}.{}() — reason: {}",
                    className, methodName, reason);
            throw new ApiException(ErrorCode.UNAUTHENTICATED);
        }

        String principal = auth.getName();

        // Bước 3: Kiểm tra role (nếu roles[] không rỗng)
        String[] requiredRoles = requiresRole.roles();
        if (requiredRoles.length > 0) {
            Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
            Set<String> grantedRoles = authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());

            boolean hasRole = Arrays.stream(requiredRoles)
                    .anyMatch(role -> grantedRoles.contains(role)
                            || grantedRoles.contains("ROLE_" + role));

            if (!hasRole) {
                log.warn("[SECURITY] FORBIDDEN — user='{}' lacks roles {} for {}.{}() — reason: {}",
                        principal, Arrays.toString(requiredRoles),
                        className, methodName, reason);
                throw new ApiException(ErrorCode.FORBIDDEN_ACTION);
            }
        }

        log.info("[SECURITY] ACCESS GRANTED — user='{}' → {}.{}()",
                principal, className, methodName);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 2: AUDIT LOG CHO TOÀN BỘ CONTROLLER
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Before — Ghi audit log mỗi khi có request đến controller.
     * Ghi nhận: ai (principal) đang gọi method nào.
     * Không block request — chỉ ghi log.
     */
    @Before("controllerLayer()")
    public void auditControllerAccess(JoinPoint joinPoint) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String principal = (auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal()))
                ? auth.getName()
                : "ANONYMOUS";

        String className  = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        log.info("[AUDIT] principal='{}' → {}.{}()", principal, className, methodName);
    }
}
