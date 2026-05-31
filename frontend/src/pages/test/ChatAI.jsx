import React, { useState, useRef, useEffect } from 'react';
import { apiVoice } from "../../services/apiVoice.js";

const ChatAI = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', type: 'text', content: 'Chào bạn, tôi là trợ lý AI. Bạn muốn hỏi gì nào?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ==========================================
    // 1. NHẬN DIỆN GIỌNG NÓI (MIC)
    // ==========================================
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome/Edge.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'vi-VN';
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
            let currentTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setInputValue(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Lỗi Mic:", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.start();
        setIsListening(true);
    };

    // ==========================================
    // 2. GỬI TIN NHẮN VÀ NHẬN AUDIO TỪ BACKEND
    // ==========================================
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        // Dừng mic nếu đang bật
        if (isListening) toggleListening();

        // Thêm tin nhắn của User vào giao diện
        const userMessage = { role: 'user', type: 'text', content: inputValue };
        setMessages(prev => [...prev, userMessage]);

        const requestData = {
            text: inputValue,
            voice: 'vi-VN-HoaiMyNeural'
        };

        setInputValue(''); // Xóa ô input
        setIsLoading(true);

        try {
            const response = await apiVoice.chat(requestData);
            const data = response.data; // Dựa theo cấu trúc axios của bạn

            // Assuming data.result chứa base64 theo chuẩn ApiResponse của bạn
            if (data.code === 1000 && data.result) {
                const base64Audio = data.result.audioBase64;

                // Gắn audio vào chat
                const aiMessage = { role: 'ai', type: 'audio', audioData: base64Audio };
                setMessages(prev => [...prev, aiMessage]);

                // Tự động phát âm thanh
                const audioSrc = `data:audio/mpeg;base64,${base64Audio}`;
                const audio = new Audio(audioSrc);
                await audio.play();
            } else {
                setMessages(prev => [...prev, { role: 'ai', type: 'text', content: `Lỗi: ${data.message}` }]);
            }
        } catch (error) {
            console.error("Lỗi gọi API Chat:", error);
            setMessages(prev => [...prev, { role: 'ai', type: 'text', content: "Không thể kết nối đến máy chủ." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ==========================================
    // 3. RENDER GIAO DIỆN
    // ==========================================
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', maxWidth: '600px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>

            {/* Header */}
            <div style={{ padding: '15px', backgroundColor: '#007bff', color: 'white', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                Trợ Lý Ảo RAG (Voice & Text)
            </div>

            {/* Chat History */}
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>

                        {/* Nếu là chữ */}
                        {msg.type === 'text' && (
                            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: msg.role === 'user' ? '#007bff' : '#e9ecef', color: msg.role === 'user' ? 'white' : 'black' }}>
                                {msg.content}
                            </div>
                        )}

                        {/* Nếu là Audio (AI trả về) */}
                        {msg.type === 'audio' && (
                            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>🎙️ AI đang nói...</span>
                                <audio controls src={`data:audio/mpeg;base64,${msg.audioData}`} style={{ height: '30px', width: '200px' }}></audio>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', padding: '10px', borderRadius: '10px', backgroundColor: '#e9ecef', color: 'gray' }}>
                        ⏳ AI đang suy nghĩ và tổng hợp giọng nói...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '10px', borderTop: '1px solid #ccc', display: 'flex', gap: '10px', backgroundColor: 'white', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>

                <button
                    onClick={toggleListening}
                    style={{ padding: '10px', borderRadius: '50%', border: 'none', backgroundColor: isListening ? '#dc3545' : '#6c757d', color: 'white', cursor: 'pointer', width: '45px', height: '45px' }}
                    title="Nhấn để nói"
                >
                    {isListening ? '🛑' : '🎤'}
                </button>

                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi hoặc nhấn mic để nói..."
                    rows="1"
                    style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', resize: 'none', fontFamily: 'inherit' }}
                />

                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: (isLoading || !inputValue.trim()) ? 'not-allowed' : 'pointer', opacity: (isLoading || !inputValue.trim()) ? 0.6 : 1, fontWeight: 'bold' }}
                >
                    Gửi
                </button>
            </div>
        </div>
    );
};

export default ChatAI;