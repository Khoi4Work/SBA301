import apiClient from "./apiClient.js";


export const apiRag = {
    ask: (formData) => {
        return apiClient.post('/rag/ask',
            formData
        );
    },
}