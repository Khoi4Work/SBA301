import apiClient from "./apiClient";

const unwrap = (response) => {
    return response.data?.data ?? response.data?.result ?? response.data;
};

const buildFormData = (payload, file, idleFile, talkingFile, thinkingFile) => {
    const formData = new FormData();

    formData.append("name", payload.name || "");
    formData.append("avatarUrl", payload.avatarUrl || "");
    formData.append("shortQuote", payload.shortQuote || "");
    formData.append("category", payload.category || "");
    formData.append("core", payload.core || "");
    formData.append("biography", payload.biography || "");
    formData.append("systemPrompt", payload.systemPrompt || "");

    if (file) {
        formData.append("file", file);
    }
    if (idleFile) {
        formData.append("idleFile", idleFile);
    }
    if (talkingFile) {
        formData.append("talkingFile", talkingFile);
    }
    if (thinkingFile) {
        formData.append("thinkingFile", thinkingFile);
    }

    return formData;
};

export const philosopherService = {
    getAll: async () => {
        const res = await apiClient.get("/philosophers/");
        return unwrap(res);
    },

    create: async (payload, file, idleFile, talkingFile, thinkingFile) => {
        const formData = buildFormData(payload, file, idleFile, talkingFile, thinkingFile);

        const res = await apiClient.post("/philosophers/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return unwrap(res);
    },

    update: async (id, payload, file, idleFile, talkingFile, thinkingFile) => {
        const formData = buildFormData(payload, file, idleFile, talkingFile, thinkingFile);

        const res = await apiClient.put(`/philosophers/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return unwrap(res);
    },

    deleteById: async (id) => {
        const res = await apiClient.delete(`/philosophers/${id}`);
        return unwrap(res);
    },
};