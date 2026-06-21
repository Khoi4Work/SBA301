import apiClient from "./apiClient.js";

export const apiChatHistory = {
    getSessionHistory: (sessionId) => {
        return apiClient.get(`/chat-history/session/${sessionId}`);
    },
    getUserHistory: () => {
        return apiClient.get('/chat-history');
    }
};
