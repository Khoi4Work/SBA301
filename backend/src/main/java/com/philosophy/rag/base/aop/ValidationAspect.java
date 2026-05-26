package com.philosophy.rag.base.aop;

import com.philosophy.rag.base.aop.annotation.ValidateInput;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Collection;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  ASPECT 4: VALIDATION                                    ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  Validation bổ sung ở tầng AOP (ngoài @Valid / @NotBlank)║
 * ║                                                          ║
 * ║  Kiểm tra cho method có @ValidateInput:                  ║
 * ║  • Object / any param          → không được null         ║
 * ║  • String param                → không được blank        ║
 * ║  • MultipartFile               → không được empty        ║
 * ║  • Collection (nếu bật option) → không được empty        ║
 * ║                                                          ║
 * ║  @Order(1) — chạy ĐẦU TIÊN trước Security & Transaction  ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@Slf4j
@Aspect
@Component
@Order(1)
public class ValidationAspect {

    // ──────────────────────────────────────────────────────────────────────────
    // POINTCUT DEFINITIONS
    // ──────────────────────────────────────────────────────────────────────────

    /** Method được đánh dấu @ValidateInput */
    @Pointcut("@annotation(com.philosophy.rag.base.aop.annotation.ValidateInput)")
    public void validateInputAnnotated() {}

    /** Tất cả method public trong controller */
    @Pointcut("within(com.philosophy.rag.controller..*) && execution(public * *(..))")
    public void publicControllerMethods() {}

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 1: VALIDATE @ValidateInput — Kiểm tra toàn diện theo annotation
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Before — Validate tham số cho method có @ValidateInput.
     * Duyệt qua từng tham số và kiểm tra theo type.
     */
    @Before("validateInputAnnotated()")
    public void validateAnnotatedMethod(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method    method     = signature.getMethod();
        Parameter[] params   = method.getParameters();
        Object[]  args       = joinPoint.getArgs();

        ValidateInput annotation = method.getAnnotation(ValidateInput.class);
        boolean allowNull              = annotation.allowNullParams();
        boolean rejectEmptyCollections = annotation.rejectEmptyCollections();

        String methodLabel = joinPoint.getTarget().getClass().getSimpleName()
                + "." + method.getName() + "()";

        for (int i = 0; i < params.length; i++) {
            String paramName = params[i].getName();
            Object arg       = args[i];

            // ── Kiểm tra null ──────────────────────────────────────────────
            if (arg == null) {
                if (!allowNull) {
                    log.warn("[VALIDATE] {} — param '{}' is NULL", methodLabel, paramName);
                    throw new ApiException(ErrorCode.INVALID_INPUT,
                            "Parameter '" + paramName + "' must not be null");
                }
                continue; // allowNull = true → bỏ qua các check tiếp theo
            }

            // ── Kiểm tra String blank ──────────────────────────────────────
            if (arg instanceof String str && str.isBlank()) {
                log.warn("[VALIDATE] {} — param '{}' is BLANK", methodLabel, paramName);
                throw new ApiException(ErrorCode.INVALID_INPUT,
                        "Parameter '" + paramName + "' must not be blank");
            }

            // ── Kiểm tra MultipartFile rỗng ────────────────────────────────
            if (arg instanceof MultipartFile file && file.isEmpty()) {
                log.warn("[VALIDATE] {} — param '{}' is EMPTY FILE", methodLabel, paramName);
                throw new ApiException(ErrorCode.INVALID_INPUT,
                        "Uploaded file '" + paramName + "' must not be empty");
            }

            // ── Kiểm tra Collection rỗng (nếu bật option) ──────────────────
            if (rejectEmptyCollections && arg instanceof Collection<?> col && col.isEmpty()) {
                log.warn("[VALIDATE] {} — param '{}' is EMPTY COLLECTION", methodLabel, paramName);
                throw new ApiException(ErrorCode.INVALID_INPUT,
                        "Collection '" + paramName + "' must not be empty");
            }
        }

        log.debug("[VALIDATE] {} — all params passed validation", methodLabel);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 2: VALIDATE PUBLIC CONTROLLER METHOD — Kiểm tra cơ bản
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Before — Kiểm tra cơ bản cho tất cả controller method public.
     * Chỉ log WARN khi phát hiện String blank — không throw exception
     * (để Bean Validation tiêu chuẩn xử lý chính thức).
     */
    @Before("publicControllerMethods() && !validateInputAnnotated()")
    public void preValidateControllerArgs(JoinPoint joinPoint) {
        Object[] args     = joinPoint.getArgs();
        String methodLabel = joinPoint.getTarget().getClass().getSimpleName()
                + "." + joinPoint.getSignature().getName() + "()";

        for (Object arg : args) {
            if (arg instanceof String str && str.isBlank()) {
                log.warn("[VALIDATE-PRE] {} — detected BLANK String argument (will be caught by Bean Validation)",
                        methodLabel);
            }
        }
    }
}
