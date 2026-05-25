package com.philosophy.rag.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class IngestionService implements CommandLineRunner {
//    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);
    private final VectorStore vectorStore;

    //Tim PDF de load vao variable
    @Value("classpath:/docs/Test.pdf")
    private Resource testPDF;
    // Add cau hinh PGVector
    public IngestionService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("IngestionService: Skipping automatic load because RagController now handles dynamic uploads.");
    }
}
