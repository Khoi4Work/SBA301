import apiClient from "@/services/apiClient.js";

export const login = (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

export const register = (data) => {
    return apiClient.post('/auth/register', data);
};

export const logout = () => {
    const token = localStorage.getItem("accessToken");

    return apiClient.post(
        "/auth/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

export const refresh = (refreshToken) => {
    return apiClient.post('/auth/refresh', { refreshToken });
};

export const forgotPassword = (email) => {
    return apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = (token, newPassword) => {
    return apiClient.post('/auth/reset-password', {
        token,
        newPassword,
    });
};