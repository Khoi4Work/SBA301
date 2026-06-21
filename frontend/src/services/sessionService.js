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

/**
 * Lấy danh sách các phiên hội thoại chat
 * @param {string} philosopherId - (Tùy chọn) Lọc phiên theo triết gia
 */
export async function getChatSessions(philosopherId = null) {
    const response = await apiClient.get('/chat-sessions', {
        params: { philosopherId }
    });
    return response.data?.result || [];
}

/**
 * Xóa một phiên hội thoại chat
 * @param {string} sessionId - ID của phiên hội thoại cần xóa
 */
export async function deleteChatSession(sessionId) {
    const response = await apiClient.delete(`/chat-sessions/${sessionId}`);
    return response.data;
}

/**
 * Tạo mới một phiên hội thoại chat (nếu cần khởi tạo thủ công)
 */
export async function createChatSession() {
    const response = await apiClient.post('/chat-sessions');
    return response.data?.result;
}

/**
 * Cập nhật tiêu đề của phiên hội thoại
 * @param {string} sessionId - ID của phiên hội thoại
 * @param {string} title - Tiêu đề mới
 */
export async function updateChatSessionTitle(sessionId, title) {
    const response = await apiClient.patch(`/chat-sessions/${sessionId}/title`, { title });
    return response.data;
}
