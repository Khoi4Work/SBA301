package com.philosophy.rag.base.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  ASPECT 3: TRANSACTION                                   ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  Quan sát và ghi log toàn bộ vòng đời transaction:       ║
 * ║                                                          ║
 * ║  • Log khi transaction bắt đầu                           ║
 * ║  • Log khi transaction COMMIT                            ║
 * ║  • Log khi transaction ROLLBACK                          ║
 * ║  • Log tên transaction đang hoạt động                    ║
 * ║                                                          ║
 * ║  @Order(2) — chạy SAU SecurityAspect(1),                 ║
 * ║              TRƯỚC ExceptionHandlingAspect(3)            ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@Slf4j
@Aspect
@Component
@Order(2)
public class TransactionAspect {

    // ──────────────────────────────────────────────────────────────────────────
    // POINTCUT DEFINITIONS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Method được đánh dấu @Transactional ở method hoặc class.
     * Bao gồm cả javax.transaction và jakarta.transaction.
     */
    @Pointcut("@annotation(org.springframework.transaction.annotation.Transactional) " +
              "|| @within(org.springframework.transaction.annotation.Transactional)")
    public void transactionalMethod() {}

    /**
     * Tất cả method trong tầng service — thường là nơi logic DB xảy ra.
     */
    @Pointcut("within(com.philosophy.rag.service..*)")
    public void serviceLayer() {}

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE: AROUND @Transactional — Quan sát vòng đời transaction
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Around — Bọc quanh mọi method có @Transactional.
     * - Ghi log trạng thái transaction (active/readonly/name)
     * - Đăng ký TransactionSynchronization để bắt COMMIT / ROLLBACK
     * - Log exception nếu transaction bị rollback
     */
    @Around("transactionalMethod()")
    public Object observeTransaction(ProceedingJoinPoint pjp) throws Throwable {
        String className  = pjp.getTarget().getClass().getSimpleName();
        String methodName = pjp.getSignature().getName();
        String txLabel    = className + "." + methodName + "()";

        // ─── Log trạng thái trước khi thực thi ────────────────────────────
        boolean isTxActive   = TransactionSynchronizationManager.isActualTransactionActive();
        boolean isReadOnly   = TransactionSynchronizationManager.isCurrentTransactionReadOnly();
        String  txName       = TransactionSynchronizationManager.getCurrentTransactionName();

        log.info("[TX-START] {} | active={} | readOnly={} | txName={}",
                txLabel, isTxActive, isReadOnly, txName != null ? txName : "N/A");

        // ─── Đăng ký callback để bắt COMMIT / ROLLBACK ────────────────────
        if (isTxActive && TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCompletion(int status) {
                            switch (status) {
                                case TransactionSynchronization.STATUS_COMMITTED ->
                                        log.info("[TX-COMMIT]   {} — COMMITTED ✓", txLabel);
                                case TransactionSynchronization.STATUS_ROLLED_BACK ->
                                        log.warn("[TX-ROLLBACK] {} — ROLLED BACK ✗", txLabel);
                                default ->
                                        log.warn("[TX-UNKNOWN]  {} — status={}", txLabel, status);
                            }
                        }
                    }
            );
        }

        // ─── Thực thi method ───────────────────────────────────────────────
        try {
            Object result = pjp.proceed();
            log.debug("[TX-EXEC]  {} — completed without exception", txLabel);
            return result;
        } catch (Throwable ex) {
            log.error("[TX-EXEC]  {} — exception triggered potential ROLLBACK: {} — {}",
                    txLabel, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex; // Re-throw để Spring @Transactional xử lý rollback
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE: AROUND Service layer — Log method không có @Transactional
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Around — Log trạng thái transaction cho tất cả service method.
     * Phát hiện service call mà KHÔNG có transaction đang hoạt động
     * (có thể là dấu hiệu bỏ quên @Transactional).
     */
    @Around("serviceLayer() && !transactionalMethod()")
    public Object warnIfNoTransaction(ProceedingJoinPoint pjp) throws Throwable {
        boolean isTxActive = TransactionSynchronizationManager.isActualTransactionActive();

        if (!isTxActive) {
            String methodFull = pjp.getTarget().getClass().getSimpleName()
                    + "." + pjp.getSignature().getName() + "()";
            log.debug("[TX-INFO]  {} — running WITHOUT active transaction (non-transactional or read-only call)",
                    methodFull);
        }

        return pjp.proceed();
    }
}
