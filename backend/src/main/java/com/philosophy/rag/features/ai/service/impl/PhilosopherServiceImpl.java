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
    @Transactional
    public PhilosopherResponse createPhilosopher(PhilosopherRequest request, MultipartFile file) {
        String avatarUrl = request.avatarUrl();
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(file, "philosophy/avatars").getSecureUrl();
        }

        Philosopher philosopher = Philosopher.builder()
                .name(request.name())
                .avatarUrl(avatarUrl)
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
    public PhilosopherResponse updatePhilosopher(UUID id, PhilosopherRequest request, MultipartFile file) {
        Philosopher philosopher = philosopherRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        String avatarUrl = philosopher.getAvatarUrl();
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(file, "philosophy/avatars").getSecureUrl();
        } else if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            avatarUrl = request.avatarUrl();
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
