package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.response.PhilosopherResponse;
import com.philosophy.rag.entity.Philosopher;
import com.philosophy.rag.repository.custom.PhilosopherRepository;
import com.philosophy.rag.service.PhilosopherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
