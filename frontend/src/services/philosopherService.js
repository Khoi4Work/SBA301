import apiClient from "./apiClient";

const unwrap = (response) => {
    return response.data?.data ?? response.data?.result ?? response.data;
};

const buildFormData = (payload, file) => {
    const formData = new FormData();

    formData.append("name", payload.name || "");
    formData.append("avatarUrl", payload.avatarUrl || "");
    formData.append("shortQuote", payload.shortQuote || "");
    formData.append("category", payload.category || "");
    formData.append("core", payload.core || "");

    if (file) {
        formData.append("file", file);
    }

    return formData;
};

export const philosopherService = {
    getAll: async () => {
        const res = await apiClient.get("/philosophers/");
        return unwrap(res);
    },

    create: async (payload, file) => {
        const formData = buildFormData(payload, file);

        const res = await apiClient.post("/philosophers/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return unwrap(res);
    },

    update: async (id, payload, file) => {
        const formData = buildFormData(payload, file);

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