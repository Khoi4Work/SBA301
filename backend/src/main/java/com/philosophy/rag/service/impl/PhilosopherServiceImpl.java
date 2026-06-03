package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.request.PhilosopherRequest;
import com.philosophy.rag.dto.response.PhilosopherResponse;
import com.philosophy.rag.entity.Philosopher;
import com.philosophy.rag.repository.itf.PhilosopherRepository;
import com.philosophy.rag.service.PhilosopherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhilosopherServiceImpl implements PhilosopherService {

    private final PhilosopherRepository philosopherRepository;

    @Override
    public List<PhilosopherResponse> findAllPhilosophers() {
        return philosopherRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PhilosopherResponse createPhilosopher(PhilosopherRequest request) {
        Philosopher philosopher = Philosopher.builder()
                .name(request.getName())
                .avatarUrl(request.getAvatarUrl())
                .shortQuote(request.getShortQuote())
                .category(request.getCategory())
                .core(request.getCore())
                .biography(request.getBiography())
                .systemPrompt(request.getSystemPrompt())
                .build();

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
