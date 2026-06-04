package com.philosophy.rag.service;

import com.philosophy.rag.entity.Slogan;

import java.util.Optional;

public interface SloganService {

    Optional<Slogan> getSlogans();

    Slogan getRandomSlogan();

    void addSlogan(Slogan slogan);
}
