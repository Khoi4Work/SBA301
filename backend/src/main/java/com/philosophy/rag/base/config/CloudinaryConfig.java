package com.philosophy.rag.base.config;

import com.cloudinary.Cloudinary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) {
            log.warn("Cloudinary URL is not configured. Cloudinary operations might fail.");
            return new Cloudinary();
        }
        log.info("Initializing Cloudinary with configured URL");
        return new Cloudinary(cloudinaryUrl);
    }
}
