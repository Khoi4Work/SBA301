import apiClient from './apiClient';

/**
 * Lấy nội dung text của file từ S3
 * @param {string} key - S3 key của file
 */
export async function fetchLessonContent(key) {
    const response = await apiClient.post('/session/content', { key });
    return response.data?.result;
}

/**
 * Sinh 10 câu quiz từ nội dung file (AI generated)
 * @param {string} key - S3 key của file
 */
export async function generateQuiz(key) {
    const response = await apiClient.post('/session/quiz', { key });
    return response.data?.result;
}

/**
 * Text-to-Speech tiếng Việt — trả về Base64 MP3
 * @param {string} text - Văn bản cần đọc
 * @param {string} voice - Giọng đọc (mặc định vi-VN-HoaiMyNeural)
 */
export async function speakText(text, voice = 'vi-VN-HoaiMyNeural') {
    const response = await apiClient.post('/voice/speak', { text, voice });
    return response.data?.result; // Base64 MP3
}
