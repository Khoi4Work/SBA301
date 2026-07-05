package com.philosophy.rag.utils.controller;

import com.philosophy.rag.base.response.ApiResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResult<String>> healthCheck() {
        log.info("Health check request received");
        return ResponseEntity.ok(ApiResult.success("UP", "Server is up and running"));
    }
}
