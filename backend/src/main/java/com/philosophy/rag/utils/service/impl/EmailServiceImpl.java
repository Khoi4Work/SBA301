package com.philosophy.rag.utils.service.impl;

import com.philosophy.rag.utils.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Reset your PhiloVerse password");
        message.setText("""
                You requested to reset your PhiloVerse password.

                Click the link below to reset your password:
                %s

                This link will expire soon.
                If you did not request this, you can ignore this email.
                """.formatted(resetLink));

        mailSender.send(message);
    }
}