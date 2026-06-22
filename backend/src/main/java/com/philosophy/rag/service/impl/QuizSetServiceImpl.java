package com.philosophy.rag.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.persistence.Prompt;
import com.philosophy.rag.dto.request.QuizSetGenerateRequest;
import com.philosophy.rag.dto.request.QuizSubmitRequest;
import com.philosophy.rag.dto.response.QuizSetDetailResponse;
import com.philosophy.rag.dto.response.QuizSetResponse;
import com.philosophy.rag.dto.response.QuizSubmitResponse;
import com.philosophy.rag.dto.response.SessionContentResponse;
import com.philosophy.rag.entity.*;
import com.philosophy.rag.repository.*;
import com.philosophy.rag.service.QuizSetService;
import com.philosophy.rag.service.RagService;
import com.philosophy.rag.service.SessionService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
public class QuizSetServiceImpl implements QuizSetService {

    private final DocumentRepository documentRepository;
    private final QuizSetRepository quizSetRepository;
    private final QuizRepository quizRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final UserQuizResultRepository userQuizResultRepository;
    private final UserRepository userRepository;

    private final SessionService sessionService;
    private final ChatClient.Builder chatClientBuilder;
    private final ObjectMapper objectMapper;
    private final RagService ragService;

    public QuizSetServiceImpl(
            DocumentRepository documentRepository,
            QuizSetRepository quizSetRepository,
            QuizRepository quizRepository,
            QuizOptionRepository quizOptionRepository,
            UserQuizResultRepository userQuizResultRepository,
            UserRepository userRepository,
            SessionService sessionService,
            @Qualifier("quizChatClientBuilder") ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper, RagService ragService) {
        this.documentRepository = documentRepository;
        this.quizSetRepository = quizSetRepository;
        this.quizRepository = quizRepository;
        this.quizOptionRepository = quizOptionRepository;
        this.userQuizResultRepository = userQuizResultRepository;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
        this.chatClientBuilder = chatClientBuilder;
        this.objectMapper = objectMapper;
        this.ragService = ragService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizSetResponse> getQuizSets(String s3Key) {
        log.info("Fetching quiz sets for key: {}", s3Key);
        List<QuizSet> sets = quizSetRepository.findByDocumentS3Key(s3Key);
        return sets.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizSetResponse generateQuizSet(QuizSetGenerateRequest request) {
        log.info("Generating quiz set using AI for key: {}", request.getS3Key());

        // 1. Receive file và check/create Document in database
        SessionContentResponse contentResponse = sessionService.getContent(request.getS3Key());
        Document doc = documentRepository.findByS3Key(request.getS3Key())
                .orElseGet(() -> {
                    log.info("Creating new Document record in database for key: {}", request.getS3Key());
                    Document newDoc = Document.builder()
                            .title(contentResponse.getTitle())
                            .s3Key(request.getS3Key())
                            .category("Tài liệu ôn tập")
                            .fullText(contentResponse.getContent())
                            .totalSections(1)
                            .build();
                    return documentRepository.save(newDoc);
                });

        // 2. Create QuizSet have marked order
        long existingCount = quizSetRepository.findByDocumentS3Key(request.getS3Key()).size();
        String title = "Bộ đề số " + (existingCount + 1) + ": " + contentResponse.getTitle();
        
        QuizSet quizSet = QuizSet.builder()
                .title(title)
                .document(doc)
                .build();
        quizSet = quizSetRepository.save(quizSet);

        // 3. Prepare prompt send to AI for generating 20 question
        String context = contentResponse.getContent();
        if (context.length() > 15000) {
            context = context.substring(0, 15000);
        }

        String prompt = Prompt.QUIZ_SET
                .replace("{context}", context);

        String rawResponse = ragService.prompt(prompt);

        log.debug("Raw quiz generation response: {}", rawResponse);

        // 4. Parse JSON và save it in CSDL
        List<AiQuizQuestionDto> questionsDto = parseAiResponse(rawResponse);
        List<Quiz> quizzes = new ArrayList<>();

        for (AiQuizQuestionDto qDto : questionsDto) {
            Quiz quiz = Quiz.builder()
                    .document(doc)
                    .quizSet(quizSet)
                    .questionText(qDto.getQuestionText())
                    .explanation(qDto.getExplanation())
                    .quizType(Quiz.QuizType.valueOf(qDto.getQuizType()))
                    .xpReward(10)
                    .build();

            List<QuizOption> options = new ArrayList<>();
            for (AiQuizOptionDto oDto : qDto.getOptions()) {
                QuizOption option = QuizOption.builder()
                        .quiz(quiz)
                        .optionText(oDto.getOptionText())
                        .isCorrect(oDto.getIsCorrect() != null ? oDto.getIsCorrect() : false)
                        .orderIndex(oDto.getOrderIndex())
                        .build();
                options.add(option);
            }
            quiz.setOptions(options);
            quizzes.add(quiz);
        }

        quizSet.setQuizzes(quizzes);
        quizSetRepository.save(quizSet);

        return toResponse(quizSet);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSetDetailResponse getQuizSetDetail(UUID quizSetId) {
        log.info("Fetching quiz set details for id: {}", quizSetId);
        QuizSet quizSet = quizSetRepository.findById(quizSetId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bộ đề ôn tập"));

        List<QuizSetDetailResponse.QuizQuestionItem> questions = quizSet.getQuizzes().stream()
                .map(q -> {
                    // Randomize option for increasing interaction and preventing correct answer
                    List<QuizOption> shuffledOptions = new ArrayList<>(q.getOptions());
                    Collections.shuffle(shuffledOptions);

                    List<QuizSetDetailResponse.QuizOptionItem> optionItems = shuffledOptions.stream()
                            .map(o -> QuizSetDetailResponse.QuizOptionItem.builder()
                                    .optionId(o.getOptionId())
                                    .optionText(o.getOptionText())
                                    .build())
                            .collect(Collectors.toList());

                    return QuizSetDetailResponse.QuizQuestionItem.builder()
                            .quizId(q.getQuizId())
                            .questionText(q.getQuestionText())
                            .quizType(q.getQuizType().name())
                            .options(optionItems)
                            .build();
                })
                .collect(Collectors.toList());

        return QuizSetDetailResponse.builder()
                .quizSetId(quizSet.getQuizSetId())
                .title(quizSet.getTitle())
                .questions(questions)
                .build();
    }

    @Override
    @Transactional
    public QuizSubmitResponse gradeQuizSet(UUID quizSetId, QuizSubmitRequest request) {
        log.info("Grading quiz set submission for id: {}", quizSetId);

        // 1. Retrieve user info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Bạn chưa đăng nhập");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));

        // 2. Retrieve quiz set
        QuizSet quizSet = quizSetRepository.findById(quizSetId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bộ đề ôn tập"));

        Map<UUID, QuizSubmitRequest.AnswerItem> userAnswers = request.getAnswers().stream()
                .collect(Collectors.toMap(QuizSubmitRequest.AnswerItem::getQuizId, Function.identity()));

        int score = 0;
        int xpGained = 0;
        List<QuizSubmitResponse.FeedbackItem> feedbackItems = new ArrayList<>();
        List<UserQuizResult> resultsToSave = new ArrayList<>();

        for (Quiz quiz : quizSet.getQuizzes()) {
            QuizSubmitRequest.AnswerItem answer = userAnswers.get(quiz.getQuizId());
            boolean isCorrect = false;

            // Filter corrected answer to response to  FE
            List<UUID> correctOptionIds = new ArrayList<>();
            String correctText = "";
            List<String> correctPairs = new ArrayList<>();
            List<UUID> correctTimelineOrder = new ArrayList<>();

            if (answer != null) {
                switch (quiz.getQuizType()) {
                    case MULTIPLE_CHOICE:
                    case TRUE_FALSE:
                    case SCENARIO:
                        // Retrieve corrected answer from database
                        for (QuizOption opt : quiz.getOptions()) {
                            if (opt.getIsCorrect()) {
                                correctOptionIds.add(opt.getOptionId());
                            }
                        }
                        if (answer.getSelectedOptionId() != null) {
                            Optional<QuizOption> selectedOpt = quiz.getOptions().stream()
                                    .filter(o -> o.getOptionId().equals(answer.getSelectedOptionId()))
                                    .findFirst();
                            if (selectedOpt.isPresent() && selectedOpt.get().getIsCorrect()) {
                                isCorrect = true;
                            }
                        }
                        break;

                    case FILL_IN_THE_BLANK:
                        // In fill-in-the-blank, first QuizOption (or have isCorrect = true) store
                        // answer correct
                        QuizOption blankOpt = quiz.getOptions().stream()
                                .filter(QuizOption::getIsCorrect)
                                .findFirst()
                                .orElse(quiz.getOptions().isEmpty() ? null : quiz.getOptions().get(0));

                        if (blankOpt != null) {
                            correctText = blankOpt.getOptionText();
                            if (answer.getBlankText() != null &&
                                    answer.getBlankText().trim().equalsIgnoreCase(correctText.trim())) {
                                isCorrect = true;
                            }
                        }
                        break;

                    case MATCHING:
                        // Compare left and right pairs
                        // Corrected answer ís all options in DB have format "Vế Trái | Vế Phải"
                        List<String> dbPairs = quiz.getOptions().stream()
                                .map(QuizOption::getOptionText)
                                .collect(Collectors.toList());
                        correctPairs = dbPairs;

                        if (answer.getMatches() != null && !answer.getMatches().isEmpty()) {
                            boolean allMatched = true;
                            for (QuizSubmitRequest.MatchingPair pair : answer.getMatches()) {
                                String userPairString = pair.getLeft().trim() + " | " + pair.getRight().trim();
                                boolean found = dbPairs.stream().anyMatch(dbPair -> {
                                    String[] parts = dbPair.split("\\|");
                                    if (parts.length == 2) {
                                        return parts[0].trim().equalsIgnoreCase(pair.getLeft().trim()) &&
                                                parts[1].trim().equalsIgnoreCase(pair.getRight().trim());
                                    }
                                    return false;
                                });
                                if (!found) {
                                    allMatched = false;
                                    break;
                                }
                            }
                            // Apparently quantity right pairs is totally matched
                            if (allMatched && answer.getMatches().size() == dbPairs.size()) {
                                isCorrect = true;
                            }
                        }
                        break;

                    case TIMELINE:
                        // Rearrange orderIndex in ASC order
                        List<QuizOption> sortedDbOpts = quiz.getOptions().stream()
                                .sorted(Comparator
                                        .comparing(opt -> opt.getOrderIndex() != null ? opt.getOrderIndex() : 0))
                                .collect(Collectors.toList());

                        correctTimelineOrder = sortedDbOpts.stream()
                                .map(QuizOption::getOptionId)
                                .collect(Collectors.toList());

                        if (answer.getOrderedOptionIds() != null &&
                                answer.getOrderedOptionIds().size() == sortedDbOpts.size()) {
                            boolean timelineCorrect = true;
                            for (int i = 0; i < sortedDbOpts.size(); i++) {
                                if (!sortedDbOpts.get(i).getOptionId().equals(answer.getOrderedOptionIds().get(i))) {
                                    timelineCorrect = false;
                                    break;
                                }
                            }
                            isCorrect = timelineCorrect;
                        }
                        break;
                }
            }

            if (isCorrect) {
                score++;
                xpGained += quiz.getXpReward();
            } else {
                xpGained -= 5;
            }

            // Save the result
            UserQuizResult quizResult = UserQuizResult.builder()
                    .user(user)
                    .quiz(quiz)
                    .isCorrectAnswer(isCorrect)
                    .build();
            resultsToSave.add(quizResult);

            feedbackItems.add(QuizSubmitResponse.FeedbackItem.builder()
                    .quizId(quiz.getQuizId())
                    .isCorrect(isCorrect)
                    .explanation(quiz.getExplanation())
                    .correctOptionIds(correctOptionIds)
                    .correctText(correctText)
                    .correctPairs(correctPairs)
                    .correctTimelineOrder(correctTimelineOrder)
                    .build());
        }

        // Save all results
        userQuizResultRepository.saveAll(resultsToSave);

        // Update XP's User (not negative) and increase streak by one
        int newTotalXp = Math.max(0, user.getTotalXp() + xpGained);
        user.setTotalXp(newTotalXp);
        user.setStreak(user.getStreak() + 1);
        userRepository.save(user);

        return QuizSubmitResponse.builder()
                .score(score)
                .xpGained(xpGained)
                .newTotalXp(newTotalXp)
                .details(feedbackItems)
                .build();
    }

    // ── Helper: map entity -> response ────────────────────────────────────────

    private QuizSetResponse toResponse(QuizSet set) {
        return QuizSetResponse.builder()
                .quizSetId(set.getQuizSetId())
                .title(set.getTitle())
                .documentId(set.getDocument().getDocumentId())
                .documentTitle(set.getDocument().getTitle())
                .questionCount(set.getQuizzes() != null ? set.getQuizzes().size() : 0)
                .createdAt(set.getCreatedAt())
                .build();
    }

    // ── Helper: build prompt & parse response ─────────────────────────────────

    private List<AiQuizQuestionDto> parseAiResponse(String rawResponse) {
        String jsonStr = rawResponse.trim();
        Pattern jsonPattern = Pattern.compile("```json\\s*(\\[.*?\\].*?)\\s*```", Pattern.DOTALL);
        Matcher matcher = jsonPattern.matcher(jsonStr);
        if (matcher.find()) {
            jsonStr = matcher.group(1);
        } else {
            int start = jsonStr.indexOf('[');
            int end = jsonStr.lastIndexOf(']');
            if (start >= 0 && end > start) {
                jsonStr = jsonStr.substring(start, end + 1);
            }
        }

        try {
            List<AiQuizQuestionDto> questions = objectMapper.readValue(
                    jsonStr, new TypeReference<List<AiQuizQuestionDto>>() {
                    });
            // Limit exactly 20 question
            return questions.size() > 20 ? questions.subList(0, 20) : questions;
        } catch (Exception e) {
            log.error("Failed to parse AI generated quiz JSON: {}", e.getMessage(), e);
            log.error("Raw response: {}", rawResponse);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR,
                    "AI sinh bộ đề không đúng định dạng JSON. Vui lòng thử lại.");
        }
    }

    // ── Helper DTOs cho việc parse AI response ────────────────────────────────

    @Data
    public static class AiQuizQuestionDto {
        private String quizType;
        private String questionText;
        private String explanation;
        private List<AiQuizOptionDto> options;
    }

    @Data
    public static class AiQuizOptionDto {
        private String optionText;
        private Boolean isCorrect;
        private Integer orderIndex;
    }
}
