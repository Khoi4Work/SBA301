package com.philosophy.rag.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.ParagraphPdfDocumentReader;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class IngestionService implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);
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
        List<Document> allDocuments = new ArrayList<>();

        log.info("Reading PDF file");
        var pdfReader = new ParagraphPdfDocumentReader(testPDF);
        allDocuments.addAll(pdfReader.read());
        // 800: Maximum do dai 1 doan
        // 400: Minimum do dai 1 doan
        // 5: Cut ky tu
        // 10000: Cut maximum de tranh full RAM
        TextSplitter textSplitter = new TokenTextSplitter(800,
                400, 5, 10000, true);
        log.info("Cutting documents and embeddings into database");
        vectorStore.accept(textSplitter.apply(allDocuments));
        log.info("VectorStore loaded with data");
    }
}
