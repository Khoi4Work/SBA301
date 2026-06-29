package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.dto.PhilosopherRequest;
import com.philosophy.rag.features.ai.dto.PhilosopherResponse;
import com.philosophy.rag.features.ai.entity.Philosopher;
import com.philosophy.rag.features.ai.repository.PhilosopherRepository;
import com.philosophy.rag.utils.service.MediaStorageService;
import com.philosophy.rag.features.ai.service.PhilosopherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;

@Service
@RequiredArgsConstructor
public class PhilosopherServiceImpl implements PhilosopherService {

    private final PhilosopherRepository philosopherRepository;
    private final MediaStorageService cloudinaryService;

    @Override
    public List<PhilosopherResponse> findAllPhilosophers() {
        return philosopherRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PhilosopherResponse findPhilosopherById(UUID id) {
        Philosopher philosopher = philosopherRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        return mapToResponse(philosopher);
    }

    @Override
    @Transactional
    public PhilosopherResponse createPhilosopher(PhilosopherRequest request, MultipartFile file, MultipartFile idleFile, MultipartFile talkingFile, MultipartFile thinkingFile) {
        String avatarUrl = request.avatarUrl();
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(file, "philosophy/avatars").getSecureUrl();
        }

        String idleUrl = null;
        if (idleFile != null && !idleFile.isEmpty()) {
            idleUrl = cloudinaryService.uploadModel(idleFile, "philosophy/models").getSecureUrl();
        }

        String talkingUrl = null;
        if (talkingFile != null && !talkingFile.isEmpty()) {
            talkingUrl = cloudinaryService.uploadModel(talkingFile, "philosophy/models").getSecureUrl();
        }

        String thinkingUrl = null;
        if (thinkingFile != null && !thinkingFile.isEmpty()) {
            thinkingUrl = cloudinaryService.uploadModel(thinkingFile, "philosophy/models").getSecureUrl();
        }

        Philosopher philosopher = Philosopher.builder()
                .name(request.name())
                .avatarUrl(avatarUrl)
                .idleModelUrl(idleUrl)
                .talkingModelUrl(talkingUrl)
                .thinkingModelUrl(thinkingUrl)
                .shortQuote(request.shortQuote())
                .category(request.category())
                .core(request.core())
                .biography(request.biography())
                .systemPrompt(request.systemPrompt())
                .build();

        Philosopher saved = philosopherRepository.save(philosopher);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAllPhilosophers() {
        philosopherRepository.deleteAll();
    }

    @Override
    @Transactional
    public PhilosopherResponse updatePhilosopher(UUID id, PhilosopherRequest request, MultipartFile file, MultipartFile idleFile, MultipartFile talkingFile, MultipartFile thinkingFile) {
        Philosopher philosopher = philosopherRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        String avatarUrl = philosopher.getAvatarUrl();
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(file, "philosophy/avatars").getSecureUrl();
        } else if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            avatarUrl = request.avatarUrl();
        }

        if (idleFile != null && !idleFile.isEmpty()) {
            philosopher.setIdleModelUrl(cloudinaryService.uploadModel(idleFile, "philosophy/models").getSecureUrl());
        }
        if (talkingFile != null && !talkingFile.isEmpty()) {
            philosopher.setTalkingModelUrl(cloudinaryService.uploadModel(talkingFile, "philosophy/models").getSecureUrl());
        }
        if (thinkingFile != null && !thinkingFile.isEmpty()) {
            philosopher.setThinkingModelUrl(cloudinaryService.uploadModel(thinkingFile, "philosophy/models").getSecureUrl());
        }

        philosopher.setName(request.name());
        philosopher.setAvatarUrl(avatarUrl);
        philosopher.setShortQuote(request.shortQuote());
        philosopher.setCategory(request.category());
        philosopher.setCore(request.core());
        philosopher.setBiography(request.biography());
        philosopher.setSystemPrompt(request.systemPrompt());

        Philosopher saved = philosopherRepository.save(philosopher);
        return mapToResponse(saved);
    }

    private PhilosopherResponse mapToResponse(Philosopher entity) {
        return PhilosopherResponse.builder()
                .id(entity.getPhilosopherId())
                .name(entity.getName())
                .category(entity.getCategory())
                .quote(entity.getShortQuote())
                .core(entity.getCore())
                .imageUrl(entity.getAvatarUrl())
                .idleModelUrl(entity.getIdleModelUrl())
                .talkingModelUrl(entity.getTalkingModelUrl())
                .thinkingModelUrl(entity.getThinkingModelUrl())
                .biography(entity.getBiography())
                .systemPrompt(entity.getSystemPrompt())
                .build();
    }

    @Override
    @Transactional
    public void deletePhilosopherById(UUID id) {
        Philosopher philosopher = philosopherRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        philosopherRepository.delete(philosopher);
    }
}
