package com.philosophy.rag.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.persistence.Prompt;
import com.philosophy.rag.dto.response.QuizGenerateResponse;
import com.philosophy.rag.dto.response.QuizQuestion;
import com.philosophy.rag.dto.response.SessionContentResponse;
import com.philosophy.rag.service.RagService;
import com.philosophy.rag.service.S3StorageService;
import com.philosophy.rag.service.SessionService;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class SessionServiceImpl implements SessionService {

    private final S3StorageService s3StorageService;
    private final ObjectMapper objectMapper;
    private final RagService ragService;

    public SessionServiceImpl(S3StorageService s3StorageService, ObjectMapper objectMapper, RagService ragService) {
        this.s3StorageService = s3StorageService;
        this.objectMapper = objectMapper;
        this.ragService = ragService;
    }

    // ─── getContent ───────────────────────────────────────────────────────────

    @Override
    public SessionContentResponse getContent(String s3Key) {
        log.info("Fetching session content for key: {}", s3Key);

        // 1. Download file bytes từ S3
        byte[] fileBytes = s3StorageService.downloadDocument(s3Key);
        String contentType = s3StorageService.getContentType(s3Key);

        // 2. Extract filename
        String rawFileName = s3Key.substring(s3Key.lastIndexOf('/') + 1);
        String fileName = (rawFileName.length() > 37 && rawFileName.charAt(36) == '-')
                ? rawFileName.substring(37)
                : rawFileName;
        String title = stripExtension(fileName);

        // 3. Extract text theo loại file
        String text = extractText(fileBytes, fileName, contentType);

        return SessionContentResponse.builder()
                .key(s3Key)
                .title(title)
                .fileName(fileName)
                .content(text)
                .contentType(contentType)
                .fileSize(fileBytes.length)
                .build();
    }

    // ─── generateQuiz ─────────────────────────────────────────────────────────

    @Override
    public QuizGenerateResponse generateQuiz(String s3Key) {
        log.info("Generating quiz for key: {}", s3Key);

        // Lấy content trước
        SessionContentResponse content = getContent(s3Key);

        // Giới hạn context để tránh vượt quá context window của model
        String context = content.getContent();
        if (context.length() > 12000) {
            context = context.substring(0, 12000);
        }

        String prompt = buildQuizPrompt(context);

        String rawResponse = ragService.prompt(prompt);

        log.debug("Raw quiz response from AI: {}", rawResponse);

        List<QuizQuestion> questions = parseQuizResponse(rawResponse);

        return QuizGenerateResponse.builder()
                .title(content.getTitle())
                .questions(questions)
                .build();
    }

    // ─── Helpers: Text Extraction ─────────────────────────────────────────────

    private String extractText(byte[] bytes, String fileName, String contentType) {
        String lower = fileName.toLowerCase();
        try {
            if (lower.endsWith(".pdf") || (contentType != null && contentType.contains("pdf"))) {
                return extractPdf(bytes);
            } else if (lower.endsWith(".docx") || lower.endsWith(".doc") ||
                    contentType != null && contentType.contains("openxmlformats")) {
                return extractDocx(bytes);
            } else if (lower.endsWith(".md") || lower.endsWith(".txt") ||
                    contentType != null && (contentType.contains("text") || contentType.contains("markdown"))) {
                return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            } else {
                // fallback: thử đọc như UTF-8 text
                return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.error("Failed to extract text from file {}: {}", fileName, e.getMessage());
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Không thể đọc nội dung file: " + e.getMessage());
        }
    }

    private String extractPdf(byte[] bytes) throws IOException {
        try (PDDocument doc = PDDocument.load(new ByteArrayInputStream(bytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc).trim();
        }
    }

    private String extractDocx(byte[] bytes) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes))) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph para : doc.getParagraphs()) {
                String text = para.getText();
                if (text != null && !text.isBlank()) {
                    sb.append(text).append("\n");
                }
            }
            return sb.toString().trim();
        }
    }

    private String stripExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.substring(0, dot) : fileName;
    }

    // ─── Helpers: Quiz Prompt & Parse ─────────────────────────────────────────

    private String buildQuizPrompt(String context) {
        return Prompt.QUIZ_GENERATOR
                .replace("{context}", context);
    }

    private List<QuizQuestion> parseQuizResponse(String rawResponse) {
        // Thử tách JSON từ response (AI có thể bọc trong ```json ... ```)
        String jsonStr = rawResponse.trim();

        // Tìm JSON array trong response
        Pattern jsonPattern = Pattern.compile("```json\\s*(\\[.*?\\])\\s*```", Pattern.DOTALL);
        Matcher matcher = jsonPattern.matcher(jsonStr);
        if (matcher.find()) {
            jsonStr = matcher.group(1);
        } else {
            // Tìm array trực tiếp
            int start = jsonStr.indexOf('[');
            int end = jsonStr.lastIndexOf(']');
            if (start >= 0 && end > start) {
                jsonStr = jsonStr.substring(start, end + 1);
            }
        }

        try {
            List<QuizQuestion> questions = objectMapper.readValue(
                    jsonStr, new TypeReference<List<QuizQuestion>>() {
                    });
            // Đảm bảo chỉ lấy 10 câu
            return questions.size() > 10 ? questions.subList(0, 10) : questions;
        } catch (Exception e) {
            log.error("Failed to parse quiz JSON: {}", e.getMessage());
            log.error("Raw response was: {}", rawResponse);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR,
                    "AI không tạo được quiz đúng định dạng. Vui lòng thử lại.");
        }
    }
}
