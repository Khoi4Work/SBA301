import apiClient from './apiClient';

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