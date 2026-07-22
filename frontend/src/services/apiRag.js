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

    getDocuments: (page = 0, size = 10) => {
        return apiClient.get("/rag/documents", { params: { page, size } });
    },

    resetKnowledgeBase: () => {
        return apiClient.delete("/rag/reset");
    },

    deleteDocument: (source) => {
        return apiClient.delete("/rag/documents", { params: { source } });
    },

    getDocumentChunks: (source, page = 0, size = 1) => {
        return apiClient.get("/rag/documents/chunks", { params: { source, page, size } });
    },
};