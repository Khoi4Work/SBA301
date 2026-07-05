package com.philosophy.rag;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.chat.evaluation.FactCheckingEvaluator;
import org.springframework.ai.chat.evaluation.RelevancyEvaluator;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.evaluation.EvaluationRequest;
import org.springframework.ai.evaluation.EvaluationResponse;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.ai.document.Document;
import org.springframework.context.annotation.Profile;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.Stream;

@SpringBootTest
@Tag("ai-eval")
@ActiveProfiles("test")
public class RagEvaluationTest {

    @Autowired
    private ChatModel chatModel;

    @Autowired
    private VectorStore vectorStore;

    private ChatClient chatClient;

    private Advisor ragAdvisor;

    private RelevancyEvaluator relevancyEvaluator;

    private FactCheckingEvaluator factCheckingEvaluator;

    @BeforeEach
    void setUp() {
        // 1. RAG CHÍNH: Vẫn dùng mô hình thật Gemini để sinh câu trả lời
        this.chatClient = ChatClient.builder(chatModel).build();

        this.ragAdvisor = RetrievalAugmentationAdvisor.builder()
                .documentRetriever(VectorStoreDocumentRetriever.builder()
                        .vectorStore(vectorStore)
                        .topK(6)
                        .similarityThreshold(0.50)
                        .build())
                .build();

        // 2. GIÁM KHẢO: Khởi tạo mô hình Ollama chạy hoàn toàn dưới máy local
        OllamaApi ollamaApi =  OllamaApi.builder().baseUrl("http://localhost:11434").build();
        ChatModel ollamaEvaluatorModel = OllamaChatModel.builder()
                .ollamaApi(ollamaApi)
                .defaultOptions(OllamaChatOptions.builder()
                        .model("llama3.2:1b")
                        .temperature(0.0)
                        .build())
                .build();


        // 3. ĐÁNH GIÁ: Đưa Giám khảo Ollama vào 2 bộ Evaluator
        this.relevancyEvaluator = new RelevancyEvaluator(ChatClient.builder(ollamaEvaluatorModel));

        // (Đã sửa lỗi .builder() thành gọi trực tiếp Constructor 'new')
        this.factCheckingEvaluator = FactCheckingEvaluator.builder(ChatClient.builder(ollamaEvaluatorModel)).build();
    }

    @ParameterizedTest
    @MethodSource("philosophyQuestions")
    void ragAnswerShouldBeRelevantAndGrounded(RagTestCase testCase) throws InterruptedException {
        ChatResponse chatResponse = chatClient.prompt()
                .advisors(ragAdvisor)
                .user(testCase.question())
                .call()
                .chatResponse();

        String answer = chatResponse.getResult()
                .getOutput()
                .getText();

        @SuppressWarnings("unchecked")
        List<Document> contextDocuments =
                (List<Document>) chatResponse.getMetadata()
                        .get(RetrievalAugmentationAdvisor.DOCUMENT_CONTEXT);

        assertThat(contextDocuments)
                .as("RAG phải retrieve được context")
                .isNotNull()
                .isNotEmpty();

        EvaluationRequest relevancyRequest = new EvaluationRequest(
                testCase.question(),
                contextDocuments,
                answer
        );

        EvaluationResponse relevancyResponse =
                relevancyEvaluator.evaluate(relevancyRequest);

        assertThat(relevancyResponse.isPass())
                .as("""
                    Câu trả lời không liên quan hoặc không bám context.
                    Question: %s
                    Answer: %s
                    Lý do đánh trượt: %s
                    """, testCase.question(), answer, relevancyResponse.getFeedback())
                .isTrue();

        EvaluationRequest factCheckRequest = new EvaluationRequest(
                testCase.question(),
                contextDocuments,
                answer
        );

        EvaluationResponse factCheckResponse =
                factCheckingEvaluator.evaluate(factCheckRequest);



        assertThat(factCheckResponse.isPass())
                .as("""
                    Câu trả lời có thể bị hallucination.
                    Question: %s
                    Answer: %s
                    """, testCase.question(), answer)
                .isTrue();

        Thread.sleep(10000);
    }

    static Stream<RagTestCase> philosophyQuestions() {
        return Stream.of(
                new RagTestCase("Theo triết học Mác - Lênin, bản chất con người là gì và được hình thành như thế nào?"),
                new RagTestCase("Điểm khác biệt căn bản nhất giữa con người và động vật theo quan điểm của chủ nghĩa Mác - Lênin là gì?")
//                new RagTestCase("Thực chất và nguyên nhân của hiện tượng tha hóa con người trong xã hội có phân chia giai cấp là gì?"),
//                new RagTestCase("Quần chúng nhân dân đóng vai trò như thế nào trong tiến trình phát triển của lịch sử xã hội?"),
//                new RagTestCase("Trong tư tưởng Hồ Chí Minh và quan điểm của Đảng Cộng sản Việt Nam hiện nay, con người giữ vị trí và vai trò gì trong công cuộc đổi mới?")
        );
    }

    record RagTestCase(String question) {
    }
}
