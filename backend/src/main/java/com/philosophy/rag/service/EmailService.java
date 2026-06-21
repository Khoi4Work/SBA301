package com.philosophy.rag.service;

public interface EmailService {

    void sendPasswordResetEmail(String to, String resetLink);
}