package com.philosophy.rag.service;

import com.philosophy.rag.dto.request.SloganRequest;
import com.philosophy.rag.dto.response.SloganResponse;
import com.philosophy.rag.entity.Slogan;

import java.util.Optional;

public interface SloganService {

    Optional<Slogan> getSlogans();

    Slogan getRandomSlogan();

    SloganResponse addSlogan(SloganRequest request);
}
