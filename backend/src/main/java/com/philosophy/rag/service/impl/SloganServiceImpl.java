package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.request.SloganRequest;
import com.philosophy.rag.dto.response.SloganResponse;
import com.philosophy.rag.entity.Slogan;
import com.philosophy.rag.repository.SloganRepository;
import com.philosophy.rag.service.SloganService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SloganServiceImpl implements SloganService {

    private final SloganRepository sloganRepository;

    @Override
    public Optional<Slogan> getSlogans() {
        return sloganRepository.findByIsActiveTrue();
    }

    @Override
    public Slogan getRandomSlogan() {
        return sloganRepository.findRandomSlogan();
    }

    @Override
    public SloganResponse addSlogan(SloganRequest request) {
        Slogan slogan = Slogan.builder()
                .content(request.getContent())
                .author(request.getAuthor())
                .isActive(request.isActive())
                .build();
        Slogan saved = sloganRepository.save(slogan);
        return SloganResponse.builder()
                .sloganId(saved.getSloganId())
                .content(saved.getContent())
                .author(saved.getAuthor())
                .active(saved.isActive())
                .build();
    }
}
