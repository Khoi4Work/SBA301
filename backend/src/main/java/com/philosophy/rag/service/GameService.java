package com.philosophy.rag.service;

import com.philosophy.rag.dto.request.DebateGameRequest;
import com.philosophy.rag.dto.request.EscapeGameRequest;
import com.philosophy.rag.dto.response.DebateGameResponse;
import com.philosophy.rag.dto.response.EscapeGameResponse;

public interface GameService {
    EscapeGameResponse analyzeEscapeGame(EscapeGameRequest request);
    DebateGameResponse analyzeDebateGame(DebateGameRequest request);
}
