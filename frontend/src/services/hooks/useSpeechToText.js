import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechToText = ({
                                    lang = 'vi-VN',
                                    continuous = true,
                                    interimResults = true,
                                    onTranscript
                                } = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

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
            if (onTranscript) onTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
            setError(event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.start();
        setIsListening(true);
    }, [lang, continuous, interimResults, onTranscript]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const toggleListening = useCallback(() => {
        isListening ? stopListening() : startListening();
    }, [isListening, startListening, stopListening]);

    return { isListening, toggleListening, stopListening, error };
};