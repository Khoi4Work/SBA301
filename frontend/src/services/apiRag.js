import apiClient from "./apiClient.js";

export const apiRag = {
    ask: (formData) => {
        return apiClient.post("/rag/ask", formData);
    },

    uploadDocument: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post("/rag", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    getDocuments: () => {
        return apiClient.get("/rag/documents");
    },

    resetKnowledgeBase: () => {
        return apiClient.delete("/rag/reset");
    },
};