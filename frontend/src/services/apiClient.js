import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
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

// Response interceptor: handle lỗi auth
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc invalid -> clear và redirect login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
