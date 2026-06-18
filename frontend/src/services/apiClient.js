import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BE_URL || 'http://localhost:8080/api',
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: thêm token vào header
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle lỗi auth và tự động refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và request này chưa từng được thử lại (để tránh loop vô hạn)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    console.log('Attempting to refresh token...');
                    const refreshResponse = await axios.post(
                        `${import.meta.env.VITE_BE_URL || 'http://localhost:8080/api'}/auth/refresh`,
                        { refreshToken }
                    );

                    const newAccessToken = refreshResponse.data?.result?.accessToken || refreshResponse.data?.accessToken;

                    if (newAccessToken) {
                        console.log('Token refreshed successfully');
                        localStorage.setItem('accessToken', newAccessToken);

                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return apiClient.request(originalRequest);
                    } else {
                        console.warn('Refresh response did not contain a new access token');
                    }
                } catch (refreshError) {
                    console.error('Refresh token call failed:', refreshError.response?.data || refreshError.message);
                }
            } else {
                console.warn('No refresh token found in localStorage');
            }
        }

        // Nếu không có refresh token, refresh thất bại hoặc lỗi khác không phải 401
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }

        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
