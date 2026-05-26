import apiClient from "./apiClient.js";


export const apiVoice = {
    speak: (formData) => {
        return apiClient.post('/voice/speak',formData)
    }
}
