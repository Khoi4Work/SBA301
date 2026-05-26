package com.philosophy.rag.base.aop;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.IOException;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  ASPECT 6: EXCEPTION HANDLING                            ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  Xử lý exception tập trung tại tầng AOP.                 ║
 * ║  Bổ sung cho GlobalExceptionHandler (@RestControllerAdvice)║
 * ║                                                          ║
 * ║  Chức năng:                                              ║
 * ║  • @AfterThrowing trên service → dịch exception kỹ thuật ║
 * ║    thành ApiException trước khi lên controller           ║
 * ║  • @Around trên service → bọc exception không lường trước ║
 * ║  • Log stack trace cho UNEXPECTED errors                 ║
 * ║  • KHÔNG dịch ApiException (đã có mã lỗi rõ ràng)        ║
 * ║                                                          ║
 * ║  @Order(3) — chạy SAU Validation(1) và Security(2)       ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@Slf4j
@Aspect
@Component
@Order(3)
public class ExceptionHandlingAspect {

    // ──────────────────────────────────────────────────────────────────────────
    // POINTCUT DEFINITIONS
    // ──────────────────────────────────────────────────────────────────────────

    /** Tất cả method trong service layer */
    @Pointcut("within(com.philosophy.rag.service..*)")
    public void serviceLayer() {}

    /** Tất cả method trong repository layer */
    @Pointcut("within(com.philosophy.rag.repository..*)")
    public void repositoryLayer() {}

    /** Service + Repository */
    @Pointcut("serviceLayer() || repositoryLayer()")
    public void dataAccessLayer() {}

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 1: @AfterThrowing — Dịch Database Exception
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @AfterThrowing — Bắt DataAccessException từ repository/service.
     * Dịch sang ApiException với mã lỗi phù hợp.
     * Lưu ý: không dịch nếu đã là ApiException.
     */
    @AfterThrowing(pointcut = "repositoryLayer()", throwing = "ex")
    public void handleDataAccessException(JoinPoint joinPoint, DataAccessException ex) {
        String methodLabel = buildMethodLabel(joinPoint);

        if (ex instanceof DataIntegrityViolationException) {
            log.error("[EX-DB]    {} — DataIntegrityViolation: {}", methodLabel, ex.getMessage());
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE,
                    "Data integrity constraint violated: " + extractRootCause(ex));
        }

        log.error("[EX-DB]    {} — DataAccessException: {}", methodLabel, ex.getMessage());
        throw new ApiException(ErrorCode.UNEXPECTED_ERROR,
                "Database operation failed: " + ex.getMessage());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 2: @AfterThrowing — Bắt IOException
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @AfterThrowing — Bắt IOException từ service (ví dụ: đọc/ghi file PDF).
     */
    @AfterThrowing(pointcut = "serviceLayer()", throwing = "ex")
    public void handleIOException(JoinPoint joinPoint, IOException ex) {
        String methodLabel = buildMethodLabel(joinPoint);
        log.error("[EX-IO]    {} — IOException: {}", methodLabel, ex.getMessage());
        throw new ApiException(ErrorCode.RAG_SERVICE_ERROR,
                "File I/O operation failed: " + ex.getMessage());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 3: @Around — Bọc toàn bộ service, dịch exception không lường trước
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Around — Bọc quanh tất cả service method.
     * - Nếu đã là ApiException → log INFO và re-throw (đã được xử lý)
     * - Nếu là RuntimeException khác → log ERROR và dịch sang UNEXPECTED_ERROR
     * - Nếu là MaxUploadSizeExceededException → dịch sang INVALID_INPUT
     */
    @Around("serviceLayer()")
    public Object wrapServiceExceptions(ProceedingJoinPoint pjp) throws Throwable {
        String methodLabel = buildMethodLabel(pjp);
        try {
            return pjp.proceed();

        } catch (ApiException ex) {
            // Đã là ApiException → chỉ log và re-throw, không dịch lại
            log.info("[EX-API]   {} — ApiException({}) : {}",
                    methodLabel, ex.getErrorCode().name(), ex.getMessage());
            throw ex;

        } catch (MaxUploadSizeExceededException ex) {
            log.warn("[EX-SIZE]  {} — File too large: {}", methodLabel, ex.getMessage());
            throw new ApiException(ErrorCode.INVALID_INPUT,
                    "Uploaded file exceeds the maximum allowed size (5MB)");

        } catch (IllegalArgumentException ex) {
            log.warn("[EX-ARG]   {} — IllegalArgument: {}", methodLabel, ex.getMessage());
            throw new ApiException(ErrorCode.INVALID_INPUT, ex.getMessage());

        } catch (RuntimeException ex) {
            // Exception kỹ thuật chưa được xử lý → log full stack trace
            log.error("[EX-RT]    {} — Unhandled RuntimeException: {} | {}",
                    methodLabel, ex.getClass().getSimpleName(), ex.getMessage(), ex);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR,
                    "An unexpected error occurred in " + methodLabel);

        }
        // IOException và DataAccessException được xử lý bởi @AfterThrowing riêng
        // nên không cần bắt ở đây — chúng sẽ propagate qua @Around sau khi @AfterThrowing chạy
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 4: @AfterThrowing — Log toàn bộ exception tầng DATA ACCESS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @AfterThrowing — Ghi log chung cho mọi Throwable ở data access layer.
     * Không dịch exception — chỉ ghi thêm context.
     * Bổ sung cho các @AfterThrowing cụ thể bên trên.
     */
    @AfterThrowing(pointcut = "dataAccessLayer()", throwing = "ex")
    public void logDataLayerException(JoinPoint joinPoint, Throwable ex) {
        // Bỏ qua nếu đã là ApiException — tránh log trùng
        if (ex instanceof ApiException) return;

        String methodLabel = buildMethodLabel(joinPoint);
        log.error("[EX-DATA]  {} — {}: {}",
                methodLabel,
                ex.getClass().getSimpleName(),
                ex.getMessage());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    private String buildMethodLabel(JoinPoint jp) {
        return jp.getTarget().getClass().getSimpleName()
                + "." + jp.getSignature().getName() + "()";
    }

    private String buildMethodLabel(ProceedingJoinPoint pjp) {
        return pjp.getTarget().getClass().getSimpleName()
                + "." + pjp.getSignature().getName() + "()";
    }

    /**
     * Lấy message của root cause từ exception chain.
     */
    private String extractRootCause(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        return cause.getMessage() != null ? cause.getMessage() : ex.getMessage();
    }
}
