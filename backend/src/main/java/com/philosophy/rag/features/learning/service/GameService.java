package com.philosophy.rag.features.learning.service;

import com.philosophy.rag.features.learning.dto.DebateGameRequest;
import com.philosophy.rag.features.learning.dto.EscapeGameRequest;
import com.philosophy.rag.features.learning.dto.DebateGameResponse;
import com.philosophy.rag.features.learning.dto.EscapeGameResponse;

public interface GameService {
    EscapeGameResponse analyzeEscapeGame(EscapeGameRequest request);
    DebateGameResponse analyzeDebateGame(DebateGameRequest request);
}
