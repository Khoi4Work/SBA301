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
import java.util.stream.Collectors;

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
