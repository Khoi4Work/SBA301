import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechToText = ({
                                    lang = 'vi-VN',
                                    continuous = true,
                                    interimResults = true,
                                    onTranscript,
                                    onEnd // Thêm callback khi kết thúc một đợt nói
                                } = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const isUserActive = useRef(false); // Theo dõi xem người dùng có chủ động bật Mic không

    // Sử dụng ref để luôn giữ callback mới nhất, tránh lỗi closure trong onresult
    const onTranscriptRef = useRef(onTranscript);
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        setError(null);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Trình duyệt không hỗ trợ Web Speech API.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = lang;
        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = interimResults;

        recognitionRef.current.onresult = (event) => {
            let currentTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            if (onTranscriptRef.current) onTranscriptRef.current(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
            setError(event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            // Nếu người dùng vẫn đang ở trạng thái "Active" (không bấm tắt),
            // và chúng ta đang ở chế độ không continuous (để reset buffer),
            // thì tự động khởi động lại để tạo cảm giác "liên tục"
            if (isUserActive.current && !continuous) {
                startListening();
            } else {
                setIsListening(false);
            }
            if (onEnd) onEnd();
        };

        recognitionRef.current.start();
        setIsListening(true);
    }, [lang, continuous, interimResults, onEnd]); // Remove onTranscript from deps since we use ref

    const stopListening = useCallback(() => {
        isUserActive.current = false; // Đánh dấu là người dùng muốn tắt
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            isUserActive.current = true; // Đánh dấu là người dùng muốn bật
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return { isListening, toggleListening, stopListening, error };
};
