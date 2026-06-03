package com.philosophy.rag.service;

import com.philosophy.rag.dto.response.PhilosopherResponse;

import java.util.List;

public interface PhilosopherService {
    List<PhilosopherResponse> findAllPhilosophers();
}
