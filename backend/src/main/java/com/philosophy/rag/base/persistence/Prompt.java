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
}
