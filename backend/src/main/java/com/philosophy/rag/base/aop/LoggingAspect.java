package com.philosophy.rag.base.aop;

import com.philosophy.rag.base.aop.annotation.Loggable;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  ASPECT 1: LOGGING                                       ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  Tự động ghi log cho:                                    ║
 * ║  • Toàn bộ method ở tầng Controller và Service           ║
 * ║  • Method được đánh dấu @Loggable                        ║
 * ║                                                          ║
 * ║  Advice types:                                           ║
 * ║  • @Before       → Log khi vào method (args)             ║
 * ║  • @AfterReturning → Log khi method hoàn thành (result)  ║
 * ║  • @AfterThrowing  → Log khi method ném exception        ║
 * ║  • @Around       → Ghi thời gian thực thi                ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@Slf4j
@Aspect
@Component
public class LoggingAspect {

    // ──────────────────────────────────────────────────────────────────────────
    // POINTCUT DEFINITIONS
    // ──────────────────────────────────────────────────────────────────────────

    /** Tất cả method trong package controller */
    @Pointcut("within(com.philosophy.rag.controller..*)")
    public void controllerLayer() {}

    /** Tất cả method trong package service */
    @Pointcut("within(com.philosophy.rag.service..*)")
    public void serviceLayer() {}

    /** Method được đánh dấu @Loggable ở method hoặc class */
    @Pointcut("@annotation(com.philosophy.rag.base.aop.annotation.Loggable) " +
              "|| @within(com.philosophy.rag.base.aop.annotation.Loggable)")
    public void loggableAnnotated() {}

    /** Toàn bộ điểm cần log = controller + service + @Loggable */
    @Pointcut("controllerLayer() || serviceLayer() || loggableAnnotated()")
    public void allLoggablePoints() {}

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE: LOG KHI VÀO METHOD
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @Before — Ghi log trước khi thực thi method.
     * Nếu method có @Loggable(logArgs=false) → không in tham số.
     */
    @Before("allLoggablePoints()")
    public void logMethodEntry(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        // Kiểm tra annotation @Loggable để biết có log args không
        Loggable loggable = method.getAnnotation(Loggable.class);
        if (loggable == null) {
            loggable = method.getDeclaringClass().getAnnotation(Loggable.class);
        }

        String className  = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = method.getName();

        if (loggable != null && !loggable.logArgs()) {
            log.info("[LOG-IN]  {}.{}() — args: [HIDDEN]", className, methodName);
        } else {
            String args = formatArgs(joinPoint.getArgs());
            log.info("[LOG-IN]  {}.{}() — args: {}", className, methodName, args);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE: LOG KHI METHOD HOÀN THÀNH THÀNH CÔNG
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @AfterReturning — Ghi log giá trị trả về sau khi thành công.
     * Nếu @Loggable(logResult=false) → không in giá trị trả về.
     */
    @AfterReturning(pointcut = "allLoggablePoints()", returning = "result")
    public void logMethodReturn(JoinPoint joinPoint, Object result) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        Loggable loggable = method.getAnnotation(Loggable.class);
        if (loggable == null) {
            loggable = method.getDeclaringClass().getAnnotation(Loggable.class);
        }

        String className  = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = method.getName();

        if (loggable != null && !loggable.logResult()) {
            log.info("[LOG-OUT] {}.{}() — result: [HIDDEN]", className, methodName);
        } else {
            String resultStr = formatResult(result);
            log.info("[LOG-OUT] {}.{}() — result: {}", className, methodName, resultStr);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADVICE: LOG KHI METHOD NÉM EXCEPTION
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @AfterThrowing — Ghi log exception bị ném ra từ method.
     * Log ở mức ERROR bao gồm class, method và message lỗi.
     */
    @AfterThrowing(pointcut = "allLoggablePoints()", throwing = "ex")
    public void logException(JoinPoint joinPoint, Throwable ex) {
        String className  = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        log.error("[LOG-ERR] {}.{}() — EXCEPTION: {} | Message: {}",
                className, methodName,
                ex.getClass().getSimpleName(), ex.getMessage());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Format danh sách tham số thành chuỗi hiển thị.
     * Giới hạn tối đa 200 ký tự để tránh log quá dài.
     */
    private String formatArgs(Object[] args) {
        if (args == null || args.length == 0) return "[]";
        String raw = Arrays.stream(args)
                .map(arg -> arg == null ? "null" : arg.toString())
                .collect(Collectors.joining(", ", "[", "]"));
        return raw.length() > 200 ? raw.substring(0, 197) + "..." : raw;
    }

    /**
     * Format giá trị trả về thành chuỗi hiển thị.
     * Giới hạn tối đa 300 ký tự.
     */
    private String formatResult(Object result) {
        if (result == null) return "null";
        String raw = result.toString();
        return raw.length() > 300 ? raw.substring(0, 297) + "..." : raw;
    }
}
