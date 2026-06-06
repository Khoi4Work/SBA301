import apiClient  from "@/services/apiClient.js";

export  const getSloganContent = () => {
    return apiClient.get('/slogan/content');
};

export const getSloganAuthor = () => {
    return apiClient.get('/slogan/author');
};
