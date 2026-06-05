package com.philosophy.rag.service;

import com.philosophy.rag.dto.request.PhilosopherRequest;
import com.philosophy.rag.dto.response.PhilosopherResponse;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface PhilosopherService {
    List<PhilosopherResponse> findAllPhilosophers();

    PhilosopherResponse createPhilosopher(PhilosopherRequest request, MultipartFile file);

    PhilosopherResponse updatePhilosopher(java.util.UUID id, PhilosopherRequest request, MultipartFile file);

    void deleteAllPhilosophers();
}
