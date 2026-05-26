package com.philosophy.rag.base.aop;

import com.philosophy.rag.base.aop.annotation.MonitorPerformance;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import java.lang.reflect.Method;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  ASPECT 5: PERFORMANCE MONITORING                        ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  Theo dõi hiệu năng cho:                                 ║
 * ║  • Method có @MonitorPerformance (ngưỡng tuỳ chỉnh)      ║
 * ║  • Toàn bộ Service và Controller (ngưỡng mặc định)       ║
 * ║                                                          ║
 * ║  Tính năng:                                              ║
 * ║  • Đo thời gian thực thi (milliseconds)                  ║
 * ║  • Cảnh báo WARN khi vượt ngưỡng slow-method             ║
 * ║  • Thống kê: tổng calls, avg time, max time per method   ║
 * ║  • Log ở level DEBUG cho các call nhanh                  ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@Slf4j
@Aspect
@Component
public class PerformanceMonitoringAspect {

    // ── Ngưỡng mặc định (ms) — áp dụng cho controller/service không có @MonitorPerformance ──
    private static final long DEFAULT_WARN_THRESHOLD_MS  = 2000L;  // 2 giây
    private static final long DEFAULT_DEBUG_THRESHOLD_MS = 500L;   // 0.5 giây

    // ── In-memory statistics per method signature ──────────────────────────────
    private final ConcurrentHashMap<String, MethodStats> statsMap = new ConcurrentHashMap<>();

    // ──────────────────────────────────────────────────────────────────────────
    // POINTCUT DEFINITIONS
    // ──────────────────────────────────────────────────────────────────────────

    /** Method được đánh dấu @MonitorPerformance */
    @Pointcut("@annotation(com.philosophy.rag.base.aop.annotation.MonitorPerformance)")
    public void monitorPerformanceAnnotated() {}

    /** Tất cả method trong service layer */
    @Pointcut("within(com.philosophy.rag.service..*)")
    public void serviceLayer() {}

    /** Tất cả method trong controller layer */
    @Pointcut("within(com.philosophy.rag.controller..*)")
    public void controllerLayer() {}

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 1: @MonitorPerformance — Ngưỡng tuỳ chỉnh
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Around — Đo thời gian thực thi cho method có @MonitorPerformance.
     * Sử dụng ngưỡng và cấu hình từ annotation.
     */
    @Around("monitorPerformanceAnnotated()")
    public Object monitorAnnotatedMethod(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        Method method = signature.getMethod();

        MonitorPerformance annotation = method.getAnnotation(MonitorPerformance.class);
        long  thresholdMs  = annotation.thresholdMs();
        boolean alertOnSlow = annotation.alertOnSlow();
        String operationName = annotation.operationName().isEmpty()
                ? pjp.getTarget().getClass().getSimpleName() + "." + method.getName() + "()"
                : annotation.operationName();

        return executeAndMeasure(pjp, operationName, thresholdMs, alertOnSlow);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE 2: Service + Controller — Ngưỡng mặc định
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Around — Đo thời gian cho tất cả service và controller method.
     * Loại trừ những method đã có @MonitorPerformance (tránh double-wrap).
     */
    @Around("(serviceLayer() || controllerLayer()) && !monitorPerformanceAnnotated()")
    public Object monitorDefaultMethods(ProceedingJoinPoint pjp) throws Throwable {
        String operationName = pjp.getTarget().getClass().getSimpleName()
                + "." + pjp.getSignature().getName() + "()";

        return executeAndMeasure(pjp, operationName, DEFAULT_WARN_THRESHOLD_MS, true);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CORE MEASUREMENT LOGIC
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Đo thời gian thực thi và log kết quả.
     * Cập nhật thống kê trong bộ nhớ.
     */
    private Object executeAndMeasure(ProceedingJoinPoint pjp,
                                     String operationName,
                                     long thresholdMs,
                                     boolean alertOnSlow) throws Throwable {
        StopWatch stopWatch = new StopWatch(operationName);
        stopWatch.start();

        try {
            return pjp.proceed();
        } finally {
            stopWatch.stop();
            long elapsedMs = stopWatch.getTotalTimeMillis();

            // ── Cập nhật thống kê ──────────────────────────────────────────
            MethodStats stats = statsMap.computeIfAbsent(operationName, k -> new MethodStats());
            stats.record(elapsedMs);

            // ── Log theo ngưỡng ───────────────────────────────────────────
            if (alertOnSlow && elapsedMs > thresholdMs) {
                log.warn("[PERF-SLOW] ⚠ {} — {}ms (threshold: {}ms) | calls={} avg={}ms max={}ms",
                        operationName, elapsedMs, thresholdMs,
                        stats.getTotalCalls(), stats.getAvgMs(), stats.getMaxMs());
            } else if (elapsedMs > DEFAULT_DEBUG_THRESHOLD_MS) {
                log.info("[PERF]      {} — {}ms | calls={} avg={}ms",
                        operationName, elapsedMs, stats.getTotalCalls(), stats.getAvgMs());
            } else {
                log.debug("[PERF]      {} — {}ms", operationName, elapsedMs);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // INNER CLASS: Thống kê mỗi method
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Lưu trữ thống kê hiệu năng cho một method cụ thể.
     * Thread-safe nhờ AtomicLong.
     */
    private static class MethodStats {
        private final AtomicLong totalCalls = new AtomicLong(0);
        private final AtomicLong totalMs    = new AtomicLong(0);
        private final AtomicLong maxMs      = new AtomicLong(0);

        /** Ghi nhận một lần thực thi */
        void record(long elapsedMs) {
            totalCalls.incrementAndGet();
            totalMs.addAndGet(elapsedMs);
            maxMs.updateAndGet(current -> Math.max(current, elapsedMs));
        }

        long getTotalCalls() { return totalCalls.get(); }

        /** Thời gian trung bình (ms), tránh chia cho 0 */
        long getAvgMs() {
            long calls = totalCalls.get();
            return calls == 0 ? 0 : totalMs.get() / calls;
        }

        long getMaxMs() { return maxMs.get(); }
    }
}
