package com.philosophy.rag.features.learning.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.features.ai.persistence.Prompt;
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
import com.philosophy.rag.features.learning.entity.UserQuizAnswer;
import com.philosophy.rag.features.learning.entity.UserQuizSubmission;
import com.philosophy.rag.features.learning.repository.QuizSetRepository;
import com.philosophy.rag.features.learning.repository.UserQuizSubmissionRepository;
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
    private final UserQuizSubmissionRepository userQuizSubmissionRepository;
    private final UserRepository userRepository;

    private final SessionService sessionService;
    private final ChatClient.Builder chatClientBuilder;
    private final ObjectMapper objectMapper;
    private final RagService ragService;

    public QuizSetServiceImpl(
            DocumentRepository documentRepository,
            QuizSetRepository quizSetRepository,
            UserQuizSubmissionRepository userQuizSubmissionRepository,
            UserRepository userRepository,
            SessionService sessionService,
            @Qualifier("quizChatClientBuilder") ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper, RagService ragService) {
        this.documentRepository = documentRepository;
        this.quizSetRepository = quizSetRepository;
        this.userQuizSubmissionRepository = userQuizSubmissionRepository;
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

        // 1. Check if Document already exists in PostgreSQL
        Optional<Document> existingDocOpt = documentRepository.findByS3Key(request.getS3Key());
        Document doc;
        String documentTitle;
        String documentContent;

        if (existingDocOpt.isPresent()) {
            doc = existingDocOpt.get();
            documentTitle = doc.getTitle();
            documentContent = doc.getFullText();
            log.info("Using cached Document record from database for key: {}", request.getS3Key());
        } else {
            // Lazy download and parse file if not exists
            log.info("Document not found in database. Downloading and parsing from S3 for key: {}", request.getS3Key());
            SessionContentResponse contentResponse = sessionService.getContent(request.getS3Key());
            documentTitle = contentResponse.getTitle();
            documentContent = contentResponse.getContent();

            Document newDoc = Document.builder()
                    .title(documentTitle)
                    .s3Key(request.getS3Key())
                    .category("Tài liệu ôn tập")
                    .fullText(documentContent)
                    .totalSections(1)
                    .build();
            doc = documentRepository.save(newDoc);
        }

        // 2. Create QuizSet have marked order
        long existingCount = quizSetRepository.findByDocumentS3Key(request.getS3Key()).size();
        String title = "Bộ đề số " + (existingCount + 1) + ": " + documentTitle;

        QuizSet quizSet = QuizSet.builder()
                .quizSetId(UuidCreator.getTimeOrderedEpoch())
                .title(title)
                .documentId(doc.getDocumentId())
                .documentTitle(doc.getTitle())
                .documentS3Key(doc.getS3Key())
                .createdAt(Instant.now())
                .build();

        // 3. Prepare prompt send to AI for generating 20 question
        String context = documentContent;
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
        List<UserQuizAnswer> answersToSave = new ArrayList<>();

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

            // Save the answer details
            UserQuizAnswer.UserQuizAnswerBuilder answerBuilder = UserQuizAnswer.builder()
                    .quizId(quiz.getQuizId())
                    .isCorrectAnswer(isCorrect);

            if (answer != null) {
                answerBuilder.selectedOptionId(answer.getSelectedOptionId());
                answerBuilder.blankText(answer.getBlankText());
                answerBuilder.orderedOptionIds(answer.getOrderedOptionIds());
                
                if (answer.getMatches() != null) {
                    List<UserQuizAnswer.MatchingPair> mongoMatches = answer.getMatches().stream()
                            .map(pair -> UserQuizAnswer.MatchingPair.builder()
                                    .left(pair.getLeft())
                                    .right(pair.getRight())
                                    .build())
                            .collect(Collectors.toList());
                    answerBuilder.matches(mongoMatches);
                }
            }

            UserQuizAnswer quizAnswer = answerBuilder.build();
            answersToSave.add(quizAnswer);

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

        // Save a single submission record
        UserQuizSubmission submission = UserQuizSubmission.builder()
                .submissionId(submissionId)
                .userId(user.getUserId())
                .quizSetId(quizSet.getQuizSetId())
                .quizSetTitle(quizSet.getTitle())
                .documentTitle(quizSet.getDocumentTitle())
                .score(score)
                .totalQuestions(quizSet.getQuizzes().size())
                .xpGained(xpGained)
                .answers(answersToSave)
                .completedAt(completedAt)
                .build();

        userQuizSubmissionRepository.save(submission);

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

        // 2. Lấy toàn bộ danh sách lượt nộp bài của User
        List<UserQuizSubmission> submissions = userQuizSubmissionRepository.findByUserId(user.getUserId());

        // 3. Map thành danh sách DTO và sắp xếp giảm dần theo thời gian nộp bài
        return submissions.stream()
                .map(sub -> QuizHistoryResponse.builder()
                        .submissionId(sub.getSubmissionId())
                        .quizSetId(sub.getQuizSetId())
                        .quizSetTitle(sub.getQuizSetTitle())
                        .documentTitle(sub.getDocumentTitle())
                        .score(sub.getScore())
                        .totalQuestions(sub.getTotalQuestions())
                        .xpGained(sub.getXpGained())
                        .completedAt(sub.getCompletedAt() != null ? LocalDateTime.ofInstant(sub.getCompletedAt(), ZoneId.systemDefault()) : null)
                        .build())
                .sorted(Comparator.comparing(QuizHistoryResponse::getCompletedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionDetailResponse getQuizSubmissionDetail(UUID submissionId) {
        log.info("Fetching quiz submission detail for submissionId: {}", submissionId);

        // 1. Lấy thông tin lượt nộp bài từ MongoDB
        UserQuizSubmission submission = userQuizSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chi tiết bài làm của lượt nộp này"));

        UUID quizSetId = submission.getQuizSetId();

        // 2. Lấy bộ đề gốc
        QuizSet quizSet = quizSetRepository.findById(quizSetId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin bộ đề gốc"));

        // 3. Map danh sách câu hỏi gốc và câu trả lời tương ứng của người dùng
        Map<UUID, UserQuizAnswer> userAnswers = submission.getAnswers() != null 
                ? submission.getAnswers().stream()
                        .collect(Collectors.toMap(UserQuizAnswer::getQuizId, Function.identity(), (r1, r2) -> r1))
                : Collections.emptyMap();

        List<QuizSubmissionDetailResponse.QuestionDetailItem> questionItems = quizSet.getQuizzes().stream()
                .map(quiz -> {
                    UserQuizAnswer result = userAnswers.get(quiz.getQuizId());
                    
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

        return QuizSubmissionDetailResponse.builder()
                .submissionId(submissionId)
                .quizSetId(quizSetId)
                .quizSetTitle(submission.getQuizSetTitle())
                .documentTitle(submission.getDocumentTitle())
                .score(submission.getScore())
                .totalQuestions(submission.getTotalQuestions())
                .xpGained(submission.getXpGained())
                .completedAt(submission.getCompletedAt() != null ? LocalDateTime.ofInstant(submission.getCompletedAt(), ZoneId.systemDefault()) : null)
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
