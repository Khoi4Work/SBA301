package com.philosophy.rag.service.impl;

import com.philosophy.rag.entity.Slogan;
import com.philosophy.rag.repository.custom.SloganRepository;
import com.philosophy.rag.service.SloganService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SloganImpl implements SloganService {

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
    public void addSlogan(Slogan slogan) {
        sloganRepository.save(slogan);
    }
}
