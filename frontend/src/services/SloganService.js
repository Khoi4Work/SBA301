import apiClient  from "@/services/apiClient.js";

export  const getSlogan = () => {
    return apiClient.get('/slogan');
};

