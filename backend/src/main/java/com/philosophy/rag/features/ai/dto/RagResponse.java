package com.philosophy.rag.features.ai.dto;

import java.util.List;

public record RagResponse(String answer, List<String> sources) {}
