package com.philosophy.rag.features.ai.service;

import com.philosophy.rag.features.ai.dto.PageResponse;
import com.philosophy.rag.features.ai.dto.PhilosopherRequest;
import com.philosophy.rag.features.ai.dto.PhilosopherResponse;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface PhilosopherService {
    PageResponse<PhilosopherResponse> findAllPhilosophers(Pageable pageable);

    PhilosopherResponse findPhilosopherById(UUID id);

    PhilosopherResponse createPhilosopher(PhilosopherRequest request, MultipartFile file, MultipartFile idleFile,
            MultipartFile talkingFile, MultipartFile thinkingFile);

    PhilosopherResponse updatePhilosopher(UUID id, PhilosopherRequest request, MultipartFile file,
            MultipartFile idleFile, MultipartFile talkingFile, MultipartFile thinkingFile);

    void deleteAllPhilosophers();

    void deletePhilosopherById(UUID id);
}
