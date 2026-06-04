package com.philosophy.rag.base.persistence;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Central repository for AI prompt templates used throughout the application.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Prompt {

    public static final String RAG_ACADEMIC_PROFESSOR = """
            You are an expert academic professor. Your goal is to provide a structured and clear answer based STRICTLY on the provided context.
            Guidelines:
            1. Use Markdown formatting for the response to make it easy to read on a UI (use bold text for key terms, bullet points for lists).
            2. When citing, use the format [Source X] directly after the relevant information.
            3. If the context contains a statement that proves the fact, explicitly state 'Yes' or 'No' and then explain using a bulleted list of evidence from the sources.
            4. If the information is not available, state clearly that it's not in the provided documents.
            5. Always respond in the same language as the user's question.
            
            Context:
            {context}
            
            Question: {query}
            """;

    public static final String QUIZ_GENERATOR = """
            Bạn là giáo viên chuyên nghiệp. Dựa vào nội dung tài liệu sau, hãy tạo ra đúng 10 câu hỏi trắc nghiệm bằng tiếng Việt.

            YÊU CẦU QUAN TRỌNG:
            - Mỗi câu phải có đúng 4 lựa chọn (A, B, C, D)
            - Chỉ có 1 đáp án đúng
            - Câu hỏi phải bám sát nội dung tài liệu
            - Trả lời CHÍNH XÁC theo định dạng JSON sau, không thêm bất kỳ text nào ngoài JSON:

            ```json
            [
              {
                "index": 1,
                "question": "Câu hỏi ở đây?",
                "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
                "correctIndex": 0,
                "explanation": "Giải thích tại sao đáp án này đúng"
              }
            ]
            ```

            NỘI DUNG TÀI LIỆU:
            {context}
            """;

    public static final String QUIZ_SET = """
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
            {context}""";
}
