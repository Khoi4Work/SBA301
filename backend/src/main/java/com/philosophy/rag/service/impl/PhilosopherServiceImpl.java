package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.request.PhilosopherRequest;
import com.philosophy.rag.dto.response.PhilosopherResponse;
import com.philosophy.rag.entity.Philosopher;
import com.philosophy.rag.repository.itf.PhilosopherRepository;
import com.philosophy.rag.service.CloudinaryService;
import com.philosophy.rag.service.PhilosopherService;
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
    private final CloudinaryService cloudinaryService;

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
        String avatarUrl = request.getAvatarUrl();
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(file, "philosophy/avatars").getSecureUrl();
        }

        Philosopher philosopher = Philosopher.builder()
                .name(request.getName())
                .avatarUrl(avatarUrl)
                .shortQuote(request.getShortQuote())
                .category(request.getCategory())
                .core(request.getCore())
                .biography(request.getBiography())
                .systemPrompt(request.getSystemPrompt())
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
        } else if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            avatarUrl = request.getAvatarUrl();
        }

        philosopher.setName(request.getName());
        philosopher.setAvatarUrl(avatarUrl);
        philosopher.setShortQuote(request.getShortQuote());
        philosopher.setCategory(request.getCategory());
        philosopher.setCore(request.getCore());
        philosopher.setBiography(request.getBiography());
        philosopher.setSystemPrompt(request.getSystemPrompt());

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
}
