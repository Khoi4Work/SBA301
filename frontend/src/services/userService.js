import apiClient from "./apiClient";

const unwrap = (response) => {
    return response.data?.data ?? response.data?.result ?? response.data;
};

export const userService = {
    getAllUsers: async () => {
        const res = await apiClient.get("/users");
        return unwrap(res);
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
