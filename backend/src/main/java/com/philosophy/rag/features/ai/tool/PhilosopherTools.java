package com.philosophy.rag.features.ai.tool;

import com.philosophy.rag.features.ai.entity.Philosopher;
import com.philosophy.rag.features.ai.repository.PhilosopherRepository;
import com.philosophy.rag.features.ai.service.KnowledgeRetrievalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PhilosopherTools {

    private final PhilosopherRepository philosopherRepository;
    private final KnowledgeRetrievalService knowledgeRetrievalService;

    @Tool(description = "Use this tool ONLY when the user asks about the life, biography, birth date, family, or personal information of the philosopher. Do not use for philosophical theories.")
    public String getBiographyTool(
            @ToolParam(description = "Name of the philosopher to look up") String philosopherName) {

        log.info("[Tool Call] Fetching biography for: {}", philosopherName);

        return philosopherRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(philosopherName.toLowerCase()))
                .findFirst()
                .map(Philosopher::getBiography)
                .orElse("Currently, no biographical information is available for this philosopher in our records.");
    }

    @Tool(description = "Use this tool ONLY when the user's query requires specific factual information, quotes, or detailed philosophical arguments from the philosopher's works or the indexed documents. This is the primary source for philosophical knowledge.")
    public String searchKnowledgeBase(
            @ToolParam(description = "The search query to find relevant philosophical knowledge") String query) {

        log.info("[Tool Call] Searching knowledge base for query: {}", query);

        List<Document> candidates = knowledgeRetrievalService.retrieveCandidates(query);
        List<Document> prioritizedDocs = knowledgeRetrievalService.rankDocuments(query, candidates);
        return knowledgeRetrievalService.buildContext(prioritizedDocs);
    }
}
