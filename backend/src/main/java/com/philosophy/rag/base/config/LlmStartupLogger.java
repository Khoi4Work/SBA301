package com.philosophy.rag.base.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LlmStartupLogger implements CommandLineRunner {

    private final ChatModel chatModel;
    private final LlmProperties llmProperties;

    @Override
    public void run(String... args) {
        String provider = llmProperties.getProvider();
        String modelName = "unknown";

        try {
            if (chatModel.getDefaultOptions() != null) {
                modelName = chatModel.getDefaultOptions().getModel();
            }
        } catch (Exception e) {
            log.warn("Could not retrieve default model name from ChatModel: {}", e.getMessage());
        }

        log.info("\n" +
                "===================================================================\n" +
                "🚀 Philosophy RAG System - LLM Provider Successfully Initialized!\n" +
                "   -> Active Provider : {}\n" +
                "   -> Running Model   : {}\n" +
                "===================================================================",
                provider.toUpperCase(), modelName);
    }
}
