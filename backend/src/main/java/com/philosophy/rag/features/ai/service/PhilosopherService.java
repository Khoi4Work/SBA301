package com.philosophy.rag.features.ai.service;

import com.philosophy.rag.features.ai.dto.PhilosopherRequest;
import com.philosophy.rag.features.ai.dto.PhilosopherResponse;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface PhilosopherService {
    List<PhilosopherResponse> findAllPhilosophers();

    PhilosopherResponse createPhilosopher(PhilosopherRequest request, MultipartFile file);

    PhilosopherResponse updatePhilosopher(java.util.UUID id, PhilosopherRequest request, MultipartFile file);

    void deleteAllPhilosophers();
}
