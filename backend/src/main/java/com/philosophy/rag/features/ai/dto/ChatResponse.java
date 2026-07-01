package com.philosophy.rag.features.ai.dto;

import org.springframework.core.io.buffer.DataBuffer;
import reactor.core.publisher.Flux;

import java.util.UUID;

public record ChatResponse(String text) {}
