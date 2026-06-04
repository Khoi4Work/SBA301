package com.philosophy.rag.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.dto.request.QuizSetGenerateRequest;
import com.philosophy.rag.dto.request.QuizSubmitRequest;
import com.philosophy.rag.dto.response.QuizSetDetailResponse;
import com.philosophy.rag.dto.response.QuizSetResponse;
import com.philosophy.rag.dto.response.QuizSubmitResponse;
import com.philosophy.rag.dto.response.SessionContentResponse;
import com.philosophy.rag.entity.*;
import com.philosophy.rag.repository.itf.*;
import com.philosophy.rag.service.QuizSetService;
import com.philosophy.rag.service.SessionService;
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

    public QuizSetServiceImpl(
            DocumentRepository documentRepository,
            QuizSetRepository quizSetRepository,
            QuizRepository quizRepository,
            QuizOptionRepository quizOptionRepository,
            UserQuizResultRepository userQuizResultRepository,
            UserRepository userRepository,
            SessionService sessionService,
            @Qualifier("quizChatClientBuilder") ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.quizSetRepository = quizSetRepository;
        this.quizRepository = quizRepository;
        this.quizOptionRepository = quizOptionRepository;
        this.userQuizResultRepository = userQuizResultRepository;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
        this.chatClientBuilder = chatClientBuilder;
        this.objectMapper = objectMapper;
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

        // 1. Lấy nội dung file và kiểm tra/tạo Document trong database
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

        // 2. Tạo QuizSet
        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            title = "Bộ đề ôn tập: " + contentResponse.getTitle();
        }
        QuizSet quizSet = QuizSet.builder()
                .title(title)
                .document(doc)
                .build();
        quizSet = quizSetRepository.save(quizSet);

        // 3. Chuẩn bị prompt gửi AI sinh 20 câu hỏi
        String context = contentResponse.getContent();
        if (context.length() > 15000) {
            context = context.substring(0, 15000);
        }

        String prompt = buildPrompt(context);

        ChatClient chatClient = chatClientBuilder.build();
        String rawResponse = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        log.debug("Raw quiz generation response: {}", rawResponse);

        // 4. Parse JSON và lưu vào CSDL
        List<AiQuizQuestionDto> questionsDto = parseAiResponse(rawResponse);
        List<Quiz> quizzes = new ArrayList<>();

        for (AiQuizQuestionDto qDto : questionsDto) {
            Quiz quiz = Quiz.builder()
                    .document(doc)
                    .quizSet(quizSet)
                    .questionText(qDto.getQuestionText())
                    .explanation(qDto.getExplanation())
                    .quizType(Quiz.QuizType.valueOf(qDto.getQuizType()))
                    .xpReward(10) // cộng 10 khi trả lời đúng
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
                    // Trộn các option để tăng độ tương tác và tránh lộ đáp án đúng
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

        // 1. Lấy thông tin user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Bạn chưa đăng nhập");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));

        // 2. Lấy quiz set
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

            // Phân loại đáp án chính xác để phản hồi cho UI
            List<UUID> correctOptionIds = new ArrayList<>();
            String correctText = "";
            List<String> correctPairs = new ArrayList<>();
            List<UUID> correctTimelineOrder = new ArrayList<>();

            if (answer != null) {
                switch (quiz.getQuizType()) {
                    case MULTIPLE_CHOICE:
                    case TRUE_FALSE:
                    case SCENARIO:
                        // Lấy đáp án đúng từ database
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
                        // Trong fill-in-the-blank, QuizOption đầu tiên (hoặc có isCorrect = true) chứa kết quả đúng
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
                        // So sánh các cặp vế trái | vế phải
                        // Đáp án đúng là toàn bộ options trong DB có định dạng "Vế Trái | Vế Phải"
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
                            // Đồng thời số lượng cặp phải khớp hoàn toàn
                            if (allMatched && answer.getMatches().size() == dbPairs.size()) {
                                isCorrect = true;
                            }
                        }
                        break;

                    case TIMELINE:
                        // Sắp xếp theo orderIndex tăng dần
                        List<QuizOption> sortedDbOpts = quiz.getOptions().stream()
                                .sorted(Comparator.comparing(opt -> opt.getOrderIndex() != null ? opt.getOrderIndex() : 0))
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

            // Ghi nhận kết quả
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

        // Lưu kết quả làm bài
        userQuizResultRepository.saveAll(resultsToSave);

        // Cập nhật điểm XP của User (không âm)
        int newTotalXp = Math.max(0, user.getTotalXp() + xpGained);
        user.setTotalXp(newTotalXp);
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

    private String buildPrompt(String context) {
        return """
                Bạn là giáo viên chuyên nghiệp. Dựa vào nội dung tài liệu triết học sau, hãy tạo ra một bộ đề ôn tập gồm đúng 20 câu hỏi bằng tiếng Việt với các thể loại phân bổ như sau:
                1. Trắc nghiệm 4 đáp án (MULTIPLE_CHOICE) - 4 câu
                2. Điền vào chỗ trống (FILL_IN_THE_BLANK) - 3 câu
                3. Đúng - Sai (TRUE_FALSE) - 3 câu
                4. Nối cột (MATCHING) - 3 câu
                5. Sắp xếp dòng thời gian (TIMELINE) - 3 câu
                6. Scenario-based Quiz (SCENARIO) - 4 câu

                Yêu cầu định dạng chi tiết cho từng loại câu hỏi:
                - MULTIPLE_CHOICE: "questionText" là câu hỏi. "options" gồm 4 phần tử (chuỗi text đáp án), trong đó chỉ 1 đáp án có "isCorrect": true, các đáp án còn lại có "isCorrect": false.
                - FILL_IN_THE_BLANK: "questionText" là một câu có chứa dấu ba chấm "___" để điền từ/cụm từ còn thiếu. "options" chỉ gồm đúng 1 phần tử (đáp án chính xác để điền vào chỗ trống) với "isCorrect": true, "orderIndex": null.
                - TRUE_FALSE: "questionText" là một nhận định. "options" gồm đúng 2 phần tử: {"optionText": "Đúng", "isCorrect": ...} và {"optionText": "Sai", "isCorrect": ...}, một trong hai có "isCorrect": true.
                - MATCHING: "questionText" là yêu cầu nối thông tin (ví dụ: "Ghép cặp các triết gia sau với học thuyết tương ứng"). "options" gồm 3 đến 4 phần tử. Mỗi phần tử là một cặp tương ứng có dạng "Vế Trái | Vế Phải" (ví dụ: "Karl Marx | Duy vật lịch sử"). Tất cả các phần tử này đều có "isCorrect": true.
                - TIMELINE: "questionText" là yêu cầu sắp xếp các sự kiện theo trình tự thời gian tăng dần. "options" gồm 3 đến 4 phần tử đại diện cho các sự kiện. Mỗi phần tử phải có trường "orderIndex" (0, 1, 2...) tương ứng với thứ tự thời gian đúng của sự kiện đó (từ cũ đến mới). Tất cả các phần tử đều có "isCorrect": true.
                - SCENARIO: "questionText" bắt đầu bằng một tình huống thực tế/giả định liên quan đến triết học ("Tình huống: ..."), sau đó đưa ra câu hỏi. "options" gồm 4 phần tử lựa chọn, chỉ có 1 đáp án có "isCorrect": true.

                Trả lời CHÍNH XÁC theo định dạng JSON sau, không thêm bất kỳ text nào khác ngoài JSON:
                ```json
                [
                  {
                    "quizType": "MULTIPLE_CHOICE",
                    "questionText": "Câu hỏi trắc nghiệm?",
                    "explanation": "Giải thích vì sao...",
                    "options": [
                      {"optionText": "Lựa chọn A", "isCorrect": false},
                      {"optionText": "Lựa chọn B", "isCorrect": true},
                      {"optionText": "Lựa chọn C", "isCorrect": false},
                      {"optionText": "Lựa chọn D", "isCorrect": false}
                    ]
                  },
                  {
                    "quizType": "FILL_IN_THE_BLANK",
                    "questionText": "Triết học Mác ra đời vào những năm ___ của thế kỷ XIX.",
                    "explanation": "Giải thích...",
                    "options": [
                      {"optionText": "40", "isCorrect": true}
                    ]
                  },
                  {
                    "quizType": "TRUE_FALSE",
                    "questionText": "Ý thức có trước, vật chất có sau theo quan điểm duy vật.",
                    "explanation": "Giải thích...",
                    "options": [
                      {"optionText": "Đúng", "isCorrect": false},
                      {"optionText": "Sai", "isCorrect": true}
                    ]
                  },
                  {
                    "quizType": "MATCHING",
                    "questionText": "Hãy ghép cặp triết gia với tư tưởng của họ.",
                    "explanation": "Giải thích...",
                    "options": [
                      {"optionText": "Socrates | Tự nhận thức bản thân", "isCorrect": true},
                      {"optionText": "Karl Marx | Thuyết duy vật lịch sử", "isCorrect": true},
                      {"optionText": "Immanuel Kant | Triết học phê phán", "isCorrect": true}
                    ]
                  },
                  {
                    "quizType": "TIMELINE",
                    "questionText": "Hãy sắp xếp các sự kiện triết học sau theo thứ tự thời gian xuất hiện.",
                    "explanation": "Giải thích...",
                    "options": [
                      {"optionText": "Triết học Hy Lạp cổ đại ra đời", "isCorrect": true, "orderIndex": 0},
                      {"optionText": "Triết học kinh viện Trung cổ thống trị", "isCorrect": true, "orderIndex": 1},
                      {"optionText": "Triết học Khai sáng Pháp phát triển", "isCorrect": true, "orderIndex": 2}
                    ]
                  },
                  {
                    "quizType": "SCENARIO",
                    "questionText": "Tình huống: Nam gặp một thất bại lớn trong công việc và cảm thấy tuyệt vọng... Câu hỏi: Góc nhìn của chủ nghĩa hiện sinh sẽ khuyên Nam thế nào?",
                    "explanation": "Giải thích...",
                    "options": [
                      {"optionText": "Chấp nhận số phận", "isCorrect": false},
                      {"optionText": "Con người tự do định hình bản thân qua các lựa chọn", "isCorrect": true},
                      {"optionText": "Tránh né mọi trách nhiệm cá nhân", "isCorrect": false},
                      {"optionText": "Tìm kiếm sự giúp đỡ từ đấng siêu nhiên", "isCorrect": false}
                    ]
                  }
                ]
                ```

                NỘI DUNG TÀI LIỆU:
                """ + context;
    }

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
            // Giới hạn đúng 20 câu
            return questions.size() > 20 ? questions.subList(0, 20) : questions;
        } catch (Exception e) {
            log.error("Failed to parse AI generated quiz JSON: {}", e.getMessage(), e);
            log.error("Raw response: {}", rawResponse);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "AI sinh bộ đề không đúng định dạng JSON. Vui lòng thử lại.");
        }
    }

    // ── Helper DTOs cho việc parse AI response ────────────────────────────────

    @lombok.Data
    public static class AiQuizQuestionDto {
        private String quizType;
        private String questionText;
        private String explanation;
        private List<AiQuizOptionDto> options;
    }

    @lombok.Data
    public static class AiQuizOptionDto {
        private String optionText;
        private Boolean isCorrect;
        private Integer orderIndex;
    }
}
