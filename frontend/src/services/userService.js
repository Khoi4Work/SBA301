import apiClient from "./apiClient";

const unwrap = (response) => {
    return response.data?.data ?? response.data?.result ?? response.data;
};

export const userService = {
    getAllUsers: async (page = 0, size = 10) => {
        const res = await apiClient.get(`/users?page=${page}&size=${size}`);
        return res.data?.result ?? res.data?.data ?? res.data;
    },

    getGrowthStats: async () => {
        const res = await apiClient.get("/users/growth-stats");
        return res.data?.result ?? res.data?.data ?? res.data;
    },

    updateUser: async (id, payload) => {
        const res = await apiClient.put(`/users/${id}`, payload);
        return unwrap(res);
    },

    deleteUser: async (id) => {
        const res = await apiClient.delete(`/users/${id}`);
        return unwrap(res);
    },
};
