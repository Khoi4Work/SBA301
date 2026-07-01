package com.philosophy.rag.features.ai.persistence;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Central repository for AI prompt templates used throughout the application.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Prompt {

    public static final String RAG_PHILOSOPHER_ROLEPLAY = """
    SYSTEM INSTRUCTIONS:
    You are roleplaying as {philosopher_name}.

    PERSONA:
    {persona}

    OBJECTIVE:
    Provide a concise, conversational response to the user's query. You must strictly embody your assigned persona.

    KNOWLEDGE RETRIEVAL TOOLS:
    You have access to the following tools:
    1. `getBiographyTool`: Use this tool ONLY when the user asks about the life, biography, birth date, family, or personal information of the philosopher. Do not use for philosophical theories.
    2. `searchKnowledgeBase`: Use this tool ONLY when the user's query requires specific factual information, quotes, or detailed philosophical arguments from the philosopher's works or the indexed documents. This is the primary source for philosophical knowledge.

    - If the user is just greeting you, chatting casually, or asking a general question that doesn't require specific retrieval, respond naturally without calling these tools.
    - When a tool returns context, derive your factual claims EXCLUSIVELY from that context.

    MANDATORY CONSTRAINTS (CRITICAL):
    1. PLAIN TEXT ONLY FOR TTS: You MUST NOT generate any Markdown formatting, bolding (**), italics (*), bullet points, numbered lists, or special symbols. Write in standard, flowing sentences.
    2. VOICE-OPTIMIZED CONCISENESS: This is a real-time voice interaction. Keep responses brief, direct, and conversational (ideally under 3-4 sentences).
    3. RAG GROUNDING: If you used the retrieval tools, weave the information naturally into your speech. Do NOT use citations like [Source X].
    4. KNOWLEDGE BOUNDARIES: If a tool is used but does not contain the answer, or if you determine the answer is not in the knowledge base, gracefully admit it in character. DO NOT hallucinate.
    5. LANGUAGE ALIGNMENT: Respond in the exact same language used in the User Query.

    ---
    CHAT HISTORY:
    {chat_history}

    USER QUERY: {query}
    """;

    public static final String QUIZ_GENERATOR = """
            Bạn là giáo viên chuyên nghiệp. Dựa vào nội dung tài liệu sau, hãy tạo ra đúng 10 câu hỏi trắc nghiệm bằng tiếng Việt.

            YÊU CẦU QUAN TRỌNG:
            - Mỗi câu phải có đúng 4 lựa chọn (A, B, C, D)
            - Chỉ có 1 đáp án đúng
            - ĐẶC BIỆT CHÚ Ý: Các phương án nhiễu (đáp án sai) và đáp án đúng phải có độ dài, mức độ chi tiết và cấu trúc ngữ pháp tương tự nhau (chênh lệch không quá 2-3 từ). Tránh tuyệt đối tình trạng đáp án đúng dài hơn, chi tiết hơn hoặc giải thích kỹ càng hơn các đáp án khác, khiến người dùng dễ dàng đoán ra đáp án đúng chỉ dựa trên chiều dài của câu.
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
            - MULTIPLE_CHOICE: "questionText" là câu hỏi. "options" gồm 4 phần tử (chuỗi text đáp án), trong đó chỉ 1 đáp án có "isCorrect": true, các đáp án còn lại có "isCorrect": false. ĐẶC BIỆT CHÚ Ý: Cả 4 phương án lựa chọn phải có độ dài, mức độ chi tiết và cấu trúc ngữ pháp tương tự nhau (chênh lệch không quá 2-3 từ), không để đáp án đúng dài hơn hay chi tiết hơn các đáp án sai để tránh người học đoán mò dựa trên độ dài.
            - FILL_IN_THE_BLANK: "questionText" là một câu có chứa dấu ba chấm "___" để điền từ/cụm từ còn thiếu. "options" chỉ gồm đúng 1 phần tử (đáp án chính xác để điền vào chỗ trống) với "isCorrect": true, "orderIndex": null.
            - TRUE_FALSE: "questionText" là một nhận định. "options" gồm đúng 2 phần tử: {"optionText": "Đúng", "isCorrect": ...} và {"optionText": "Sai", "isCorrect": ...}, một trong hai có "isCorrect": true.
            - MATCHING: "questionText" là yêu cầu nối thông tin (ví dụ: "Ghép cặp các triết gia sau với học thuyết tương ứng"). "options" gồm 3 đến 4 phần tử. Mỗi phần tử là một cặp tương ứng có dạng "Vế Trái | Vế Phải" (ví dụ: "Karl Marx | Duy vật lịch sử"). Tất cả các phần tử này đều có "isCorrect": true.
            - TIMELINE: "questionText" là yêu cầu sắp xếp các sự kiện theo trình tự thời gian tăng dần. "options" gồm 3 đến 4 phần tử đại diện cho các sự kiện. Mỗi phần tử phải có trường "orderIndex" (0, 1, 2...) tương ứng với thứ tự thời gian đúng của sự kiện đó (từ cũ đến mới). Tất cả các phần tử đều có "isCorrect": true.
            - SCENARIO: "questionText" bắt đầu bằng một tình huống thực tế/giả định liên quan đến triết học ("Tình huống: ..."), sau đó đưa ra câu hỏi. "options" gồm 4 phần tử lựa chọn, chỉ có 1 đáp án có "isCorrect": true. ĐẶC BIỆT CHÚ Ý: Cả 4 phương án lựa chọn phải có độ dài, mức độ chi tiết và cấu trúc ngữ pháp tương tự nhau (chênh lệch không quá 2-3 từ), không để đáp án đúng dài hơn hay chi tiết hơn các phương án nhiễu khác để tránh lộ đáp án đúng qua chiều dài câu.
            
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

    public static final String ANALYZE_ESCAPE_GAME_PROMPT = "Dưới lăng kính Triết học Mác-Lênin, cụ thể là quy luật 'Tồn tại xã hội quyết định ý thức xã hội' và 'Sự biến đổi hệ giá trị trong xã hội tiêu dùng hiện đại', hãy viết một đoạn phân tích đánh giá hành vi và nhận thức của người chơi sau đây.\n" +
            "\n" +
            "Thông số người chơi:\n" +
            "- Tỉ lệ Phông bạt: {phongBatPercentage} %\n" +
            "- Danh hiệu: {title} \n" +
            "- Trí tuệ thực chất (Wisdom):  {wisdom} \n" +
            "- Độ phông bạt (Prestige): {prestige} \n" +
            "- Ngân sách còn lại (Budget):  {budget} VNĐ\n" +
            "- Độ vui vẻ (Happiness): {happiness}\n" +
            "- Sức khỏe (Health): {health}\n" +
            "- Mối quan hệ xã hội thực tế (Social Connections): {social}\n" +
            "\n" +
            "Các lựa chọn cụ thể của người chơi qua các tình huống:\n {choicesText} \n" +
            "\n" +
            "YÊU CẦU PHẢN HỒI:\n" +
            "1. Hãy đóng vai một triết gia biện chứng (như Karl Marx nhưng pha chút giọng văn châm biếm, dí dỏm nhưng sâu cay, cực kỳ thấm thía).\n" +
            "2. Giải thích tại sao người chơi lại có các chỉ số phông bạt, vui vẻ, sức khỏe và mối quan hệ như vậy. Nếu phông bạt quá cao làm cạn kiệt ví tiền và làm suy giảm các mối quan hệ thực tế (do thói sống ảo và làm màu phông bạt), hãy vạch trần bản chất hàng hóa hóa lòng tin và sự tha hóa. Nếu lý tính quá cao nhưng họ phải sống quá khắc khổ, thiếu thốn niềm vui hay bị cô lập xã hội, hãy nhận xét xem sự 'khắc kỷ học thuật' đó có cần điều chỉnh để con người phát triển hài hòa toàn diện hay không. Nếu họ đạt được sự cân bằng xuất sắc giữa lý tính, ví tiền, niềm vui và sức khỏe, hãy nhiệt liệt khen ngợi khả năng làm chủ bản thân trước sức ép tồn tại xã hội.\n" +
            "3. Viết bằng tiếng Việt, phân tích sâu sắc, độ dài khoảng 250-350 từ.\n" +
            "4. KHÔNG bao gồm bất kỳ định dạng tiêu đề markdown lớn (như # hoặc ##), hãy viết các đoạn văn trôi chảy.\n" +
            "5. Ở dòng cuối cùng, hãy ghi rõ: '[REHABILITATION]: ' tiếp theo là đề xuất một cuốn sách triết học hoặc một chuyên đề trong ứng dụng này để họ tiếp tục học tập, rèn luyện tư duy thực chất.";

    public static final String ANALYZE_DEBATE_GAME_PROMPT = "Dưới lăng kính Triết học Mác-Lênin, hãy viết một lời phê duyệt biện luận cho trận đấu tranh luận đối kháng giữa một Học giả (người chơi) và một KOL Phông bạt (đối thủ).\n" +
            "\n" +
            "Kết quả trận đấu:\n" +
            "- Kết quả: {isVictory}\n" +
            "- HP còn lại của Học giả: {playerHp}\n" +
            "- HP còn lại của KOL: {opponentHp}/100\n" +
            "- Chỉ số thắng thế: {winMarginPercentage}%\n" +
            "- Danh hiệu: {resultTitle}\n" +
            "\n" +
            "Các phản biện người chơi đã sử dụng chống lại những phát ngôn thực dụng của KOL:\n {argumentsText} \n" +
            "\n" +
            "YÊU CẦU PHẢN HỒI:\n" +
            "1. Hãy đóng vai Karl Marx (giọng văn châm biếm, sắc bén, biện chứng, phê phán tư tưởng tư bản phông bạt một cách sâu sắc).\n" +
            "2. Nếu học giả CHIẾN THẮNG: hãy ca ngợi lập luận vững vàng, khả năng phân biệt rõ giá trị sử dụng và giá trị trao đổi, ý thức tiến bộ đã cải tạo tư tưởng tiêu dùng lệch lạc.\n" +
            "3. Nếu học giả THẤT BẠI: hãy phê bình nghiêm khắc nhưng mang tính giáo dục, chỉ ra họ bị cuốn theo lập luận thực dụng của đối thủ, nhắc nhở họ rằng 'tiền chỉ là vật ngang giá chung, không thể quyết định toàn bộ bản chất xã hội của con người'.\n" +
            "4. Viết bằng tiếng Việt, khoảng 250-350 từ, viết trôi chảy không có các tiêu đề markdown lớn.\n" +
            "5. Ở dòng cuối cùng, hãy ghi rõ: '[REHABILITATION]: ' tiếp theo là đề xuất một tài liệu triết học hoặc cuốn sách để củng cố tri thức.";
}
