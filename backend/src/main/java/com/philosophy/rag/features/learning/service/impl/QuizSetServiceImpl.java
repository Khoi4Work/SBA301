package com.philosophy.rag.features.learning.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.persistence.Prompt;
import com.philosophy.rag.features.ai.service.RagService;
import com.philosophy.rag.features.auth.entity.User;
import com.philosophy.rag.features.auth.repository.UserRepository;
import com.philosophy.rag.features.learning.dto.QuizSetGenerateRequest;
import com.philosophy.rag.features.learning.dto.QuizSubmitRequest;
import com.philosophy.rag.features.learning.dto.QuizSetDetailResponse;
import com.philosophy.rag.features.learning.dto.QuizSetResponse;
import com.philosophy.rag.features.learning.dto.QuizSubmitResponse;
import com.philosophy.rag.features.learning.dto.SessionContentResponse;
import com.philosophy.rag.features.learning.dto.QuizHistoryResponse;
import com.philosophy.rag.features.learning.dto.QuizSubmissionDetailResponse;
import com.philosophy.rag.features.learning.entity.Quiz;
import com.philosophy.rag.features.learning.entity.QuizOption;
import com.philosophy.rag.features.learning.entity.QuizSet;
import com.philosophy.rag.features.learning.entity.UserQuizResult;
import com.philosophy.rag.features.learning.repository.QuizSetRepository;
import com.philosophy.rag.features.learning.repository.UserQuizResultRepository;
import com.philosophy.rag.features.learning.service.QuizSetService;
import com.philosophy.rag.features.learning.service.SessionService;
import com.philosophy.rag.utils.entity.Document;
import com.philosophy.rag.utils.repository.DocumentRepository;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import com.github.f4b6a3.uuid.UuidCreator;

@Slf4j
@Service
public class QuizSetServiceImpl implements QuizSetService {

    private final DocumentRepository documentRepository;
    private final QuizSetRepository quizSetRepository;
    private final UserQuizResultRepository userQuizResultRepository;
    private final UserRepository userRepository;

    private final SessionService sessionService;
    private final ChatClient.Builder chatClientBuilder;
    private final ObjectMapper objectMapper;
    private final RagService ragService;

    public QuizSetServiceImpl(
            DocumentRepository documentRepository,
            QuizSetRepository quizSetRepository,
            UserQuizResultRepository userQuizResultRepository,
            UserRepository userRepository,
            SessionService sessionService,
            @Qualifier("quizChatClientBuilder") ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper, RagService ragService) {
        this.documentRepository = documentRepository;
        this.quizSetRepository = quizSetRepository;
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
                .quizSetId(UuidCreator.getTimeOrderedEpoch())
                .title(title)
                .documentId(doc.getDocumentId())
                .documentTitle(doc.getTitle())
                .documentS3Key(doc.getS3Key())
                .createdAt(Instant.now())
                .build();

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
                    .quizId(UuidCreator.getTimeOrderedEpoch())
                    .questionText(qDto.getQuestionText())
                    .explanation(qDto.getExplanation())
                    .quizType(Quiz.QuizType.valueOf(qDto.getQuizType()))
                    .xpReward(10)
                    .build();

            List<QuizOption> options = new ArrayList<>();
            int optIdx = 0;
            if (qDto.getOptions() != null) {
                for (AiQuizOptionDto oDto : qDto.getOptions()) {
                    QuizOption option = QuizOption.builder()
                            .optionId(UuidCreator.getTimeOrderedEpoch())
                            .optionText(oDto.getOptionText())
                            .isCorrect(oDto.getParsedIsCorrect())
                            .orderIndex(oDto.getOrderIndex() != null ? oDto.getOrderIndex() : optIdx)
                            .build();
                    options.add(option);
                    optIdx++;
                }
            }

            // Fallback: If no option is marked correct, check correctIndex or correctText
            // from question DTO
            boolean hasCorrect = options.stream().anyMatch(QuizOption::getIsCorrect);
            if (!hasCorrect) {
                if (qDto.getCorrectIndex() != null && qDto.getCorrectIndex() >= 0
                        && qDto.getCorrectIndex() < options.size()) {
                    options.get(qDto.getCorrectIndex()).setIsCorrect(true);
                } else if (qDto.getCorrectText() != null && !qDto.getCorrectText().isEmpty()) {
                    String cleanCorrect = cleanText(qDto.getCorrectText());
                    for (QuizOption opt : options) {
                        if (cleanText(opt.getOptionText()).equals(cleanCorrect)) {
                            opt.setIsCorrect(true);
                            break;
                        }
                    }
                } else if (qDto.getCorrectAnswer() != null && !qDto.getCorrectAnswer().isEmpty()) {
                    String cleanCorrect = cleanText(qDto.getCorrectAnswer());
                    for (QuizOption opt : options) {
                        if (cleanText(opt.getOptionText()).equals(cleanCorrect)) {
                            opt.setIsCorrect(true);
                            break;
                        }
                    }
                }
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

        UUID submissionId = UuidCreator.getTimeOrderedEpoch();
        Instant completedAt = Instant.now();
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
                                     .filter(o -> o.getOptionId() != null &&
                                             o.getOptionId().toString()
                                                     .equalsIgnoreCase(answer.getSelectedOptionId().toString()))
                                    .findFirst();
                            if (selectedOpt.isPresent()) {
                                QuizOption userOpt = selectedOpt.get();
                                if (userOpt.getIsCorrect()) {
                                    isCorrect = true;
                                } else {
                                    // Text-based fallback: Check if userOpt text matches any correct option text
                                    String cleanUserOptText = cleanText(userOpt.getOptionText());
                                    boolean textMatch = quiz.getOptions().stream()
                                            .filter(QuizOption::getIsCorrect)
                                            .anyMatch(correctOpt -> cleanText(correctOpt.getOptionText())
                                                    .equals(cleanUserOptText));
                                    if (textMatch) {
                                        isCorrect = true;
                                    }
                                }
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
                                    cleanText(answer.getBlankText()).equals(cleanText(correctText))) {
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
                                boolean found = dbPairs.stream().anyMatch(dbPair -> {
                                    String[] parts = dbPair.split("\\|");
                                    if (parts.length == 2) {
                                        return cleanText(parts[0]).equals(cleanText(pair.getLeft())) &&
                                                cleanText(parts[1]).equals(cleanText(pair.getRight()));
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
            UserQuizResult.UserQuizResultBuilder resultBuilder = UserQuizResult.builder()
                    .resultId(UuidCreator.getTimeOrderedEpoch())
                    .userId(user.getUserId())
                    .quizSetId(quizSet.getQuizSetId())
                    .submissionId(submissionId)
                    .quizSetTitle(quizSet.getTitle())
                    .documentTitle(quizSet.getDocumentTitle())
                    .quizId(quiz.getQuizId())
                    .isCorrectAnswer(isCorrect)
                    .completedAt(completedAt);

            if (answer != null) {
                resultBuilder.selectedOptionId(answer.getSelectedOptionId());
                resultBuilder.blankText(answer.getBlankText());
                resultBuilder.orderedOptionIds(answer.getOrderedOptionIds());
                
                if (answer.getMatches() != null) {
                    List<UserQuizResult.MongoMatchingPair> mongoMatches = answer.getMatches().stream()
                            .map(pair -> UserQuizResult.MongoMatchingPair.builder()
                                    .left(pair.getLeft())
                                    .right(pair.getRight())
                                    .build())
                            .collect(Collectors.toList());
                    resultBuilder.matches(mongoMatches);
                }
            }

            UserQuizResult quizResult = resultBuilder.build();
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

    @Override
    @Transactional(readOnly = true)
    public List<QuizHistoryResponse> getQuizHistory() {
        log.info("Fetching quiz history for the authenticated user");

        // 1. Lấy thông tin user hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Bạn chưa đăng nhập");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));

        // 2. Lấy toàn bộ danh sách kết quả làm bài của User
        List<UserQuizResult> results = userQuizResultRepository.findByUserId(user.getUserId());

        // 3. Group các kết quả theo submissionId (mỗi lượt nộp bài)
        Map<UUID, List<UserQuizResult>> groupedBySubmission = results.stream()
                .filter(r -> r.getSubmissionId() != null)
                .collect(Collectors.groupingBy(UserQuizResult::getSubmissionId));

        // 4. Map thành danh sách DTO và sắp xếp giảm dần theo thời gian nộp bài
        return groupedBySubmission.entrySet().stream()
                .map(entry -> {
                    UUID submissionId = entry.getKey();
                    List<UserQuizResult> group = entry.getValue();
                    UserQuizResult first = group.get(0);

                    long correctCount = group.stream().filter(UserQuizResult::getIsCorrectAnswer).count();
                    int totalQuestions = group.size();
                    int xpGained = group.stream().mapToInt(r -> r.getIsCorrectAnswer() ? 10 : -5).sum();

                    return QuizHistoryResponse.builder()
                            .submissionId(submissionId)
                            .quizSetId(first.getQuizSetId())
                            .quizSetTitle(first.getQuizSetTitle())
                            .documentTitle(first.getDocumentTitle())
                            .score((int) correctCount)
                            .totalQuestions(totalQuestions)
                            .xpGained(xpGained)
                            .completedAt(first.getCompletedAt() != null ? LocalDateTime.ofInstant(first.getCompletedAt(), ZoneId.systemDefault()) : null)
                            .build();
                })
                .sorted(Comparator.comparing(QuizHistoryResponse::getCompletedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionDetailResponse getQuizSubmissionDetail(UUID submissionId) {
        log.info("Fetching quiz submission detail for submissionId: {}", submissionId);

        // 1. Lấy toàn bộ kết quả làm bài của submissionId đó
        List<UserQuizResult> results = userQuizResultRepository.findBySubmissionId(submissionId);
        if (results == null || results.isEmpty()) {
            throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chi tiết bài làm của lượt nộp này");
        }

        // 2. Lấy thông tin chung của lượt nộp bài
        UserQuizResult firstResult = results.get(0);
        UUID quizSetId = firstResult.getQuizSetId();

        // 3. Lấy bộ đề gốc
        QuizSet quizSet = quizSetRepository.findById(quizSetId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin bộ đề gốc"));

        // 4. Map danh sách câu hỏi gốc và câu trả lời tương ứng của người dùng
        Map<UUID, UserQuizResult> userAnswers = results.stream()
                .collect(Collectors.toMap(UserQuizResult::getQuizId, Function.identity(), (r1, r2) -> r1));

        List<QuizSubmissionDetailResponse.QuestionDetailItem> questionItems = quizSet.getQuizzes().stream()
                .map(quiz -> {
                    UserQuizResult result = userAnswers.get(quiz.getQuizId());
                    
                    // Map options
                    List<QuizSubmissionDetailResponse.OptionItem> optionItems = quiz.getOptions().stream()
                            .map(opt -> QuizSubmissionDetailResponse.OptionItem.builder()
                                    .optionId(opt.getOptionId())
                                    .optionText(opt.getOptionText())
                                    .isCorrect(opt.getIsCorrect())
                                    .orderIndex(opt.getOrderIndex())
                                    .build())
                            .collect(Collectors.toList());

                    // Xây dựng chi tiết câu hỏi kèm câu trả lời của user
                    QuizSubmissionDetailResponse.QuestionDetailItem.QuestionDetailItemBuilder questionBuilder = 
                            QuizSubmissionDetailResponse.QuestionDetailItem.builder()
                                    .quizId(quiz.getQuizId())
                                    .questionText(quiz.getQuestionText())
                                    .explanation(quiz.getExplanation())
                                    .quizType(quiz.getQuizType().name())
                                    .options(optionItems);

                    if (result != null) {
                        questionBuilder.isCorrect(result.getIsCorrectAnswer());
                        questionBuilder.selectedOptionId(result.getSelectedOptionId());
                        questionBuilder.blankText(result.getBlankText());
                        questionBuilder.orderedOptionIds(result.getOrderedOptionIds());

                        // Map matches
                        if (result.getMatches() != null) {
                            List<QuizSubmitRequest.MatchingPair> apiMatches = result.getMatches().stream()
                                    .map(pair -> {
                                        QuizSubmitRequest.MatchingPair p = new QuizSubmitRequest.MatchingPair();
                                        p.setLeft(pair.getLeft());
                                        p.setRight(pair.getRight());
                                        return p;
                                    })
                                    .collect(Collectors.toList());
                            questionBuilder.matches(apiMatches);
                        }
                    }

                    return questionBuilder.build();
                })
                .collect(Collectors.toList());

        // 5. Tính toán thống kê
        long score = results.stream().filter(UserQuizResult::getIsCorrectAnswer).count();
        int totalQuestions = results.size();
        int xpGained = results.stream().mapToInt(r -> r.getIsCorrectAnswer() ? 10 : -5).sum();

        return QuizSubmissionDetailResponse.builder()
                .submissionId(submissionId)
                .quizSetId(quizSetId)
                .quizSetTitle(firstResult.getQuizSetTitle())
                .documentTitle(firstResult.getDocumentTitle())
                .score((int) score)
                .totalQuestions(totalQuestions)
                .xpGained(xpGained)
                .completedAt(firstResult.getCompletedAt() != null ? LocalDateTime.ofInstant(firstResult.getCompletedAt(), ZoneId.systemDefault()) : null)
                .questions(questionItems)
                .build();
    }


    // ── Helper: map entity -> response ────────────────────────────────────────

    private QuizSetResponse toResponse(QuizSet set) {
        return QuizSetResponse.builder()
                .quizSetId(set.getQuizSetId())
                .title(set.getTitle())
                .documentId(set.getDocumentId())
                .documentTitle(set.getDocumentTitle())
                .questionCount(set.getQuizzes() != null ? set.getQuizzes().size() : 0)
                .createdAt(set.getCreatedAt() != null ? LocalDateTime.ofInstant(set.getCreatedAt(), ZoneId.systemDefault()) : null)
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

    private String cleanText(String text) {
        if (text == null) {
            return "";
        }
        // Normalize Unicode to NFC
        String cleaned = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFC);
        // Lowercase
        cleaned = cleaned.toLowerCase().trim();
        // Remove markdown bold/italic asterisks and underscores
        cleaned = cleaned.replaceAll("\\*+", "");
        cleaned = cleaned.replaceAll("_+", "");
        // Remove quotes (standard, curly, smart)
        cleaned = cleaned.replaceAll("^[\"\'“‘’”]+|[\"\'“‘’”]+$", "");
        // Remove trailing punctuation like dots
        cleaned = cleaned.replaceAll("[\\.\\,\\!\\?\\;]+$", "");
        return cleaned.trim();
    }

    // ── Helper DTOs cho việc parse AI response ────────────────────────────────

    @Data
    public static class AiQuizQuestionDto {
        private String quizType;
        private String questionText;
        private String explanation;
        private List<AiQuizOptionDto> options;
        private Integer correctIndex;
        private String correctText;
        private String correctAnswer;
    }

    @Data
    public static class AiQuizOptionDto {
        private String optionText;
        private Object isCorrect;
        private Boolean correct;
        private Integer orderIndex;

        public boolean getParsedIsCorrect() {
            if (isCorrect instanceof Boolean) {
                return (Boolean) isCorrect;
            }
            if (isCorrect instanceof String) {
                return "true".equalsIgnoreCase(((String) isCorrect).trim())
                        || "1".equals(((String) isCorrect).trim())
                        || "yes".equalsIgnoreCase(((String) isCorrect).trim());
            }
            if (isCorrect instanceof Number) {
                return ((Number) isCorrect).intValue() == 1;
            }
            if (correct != null) {
                return correct;
            }
            return false;
        }
    }
}
