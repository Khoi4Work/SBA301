package com.philosophy.rag.features.ai.service;

import org.springframework.ai.document.Document;
import java.util.List;

public interface KnowledgeRetrievalService {
    List<Document> retrieveCandidates(String query);
    List<Document> rankDocuments(String query, List<Document> candidates);
    String buildContext(List<Document> docs);
}
