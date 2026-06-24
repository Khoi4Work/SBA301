package com.philosophy.rag.utils.service;

public interface EmailService {

    void sendPasswordResetEmail(String to, String resetLink);
}