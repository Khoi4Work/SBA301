package com.philosophy.rag.features.ui.service;

import com.philosophy.rag.features.ui.dto.request.SloganRequest;
import com.philosophy.rag.features.ui.dto.response.SloganResponse;
import com.philosophy.rag.features.ui.entity.Slogan;

import java.util.Optional;

public interface SloganService {

    Optional<Slogan> getSlogans();

    Slogan getRandomSlogan();

    SloganResponse addSlogan(SloganRequest request);
}
