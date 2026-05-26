package com.philosophy.rag.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class RagResponse {
    private String answer;
    private List<String> sources;

    public RagResponse(String answer, List<String> sources) {
        this.answer = answer;
        this.sources = sources;
    }
}
