import React, { useState, useRef, useEffect, useCallback } from 'react';
import { apiVoice } from "@/services/apiVoice.js";
import { useSpeechToText } from '@/services/hooks/useSpeechToText.js';
import MicButton from './MicButton.jsx';
import AudioPlayer from './AudioPlayer.jsx';

const SmartChatAI = ({
                         title = "Trợ Lý Ảo Thông Minh",
                         voiceId = "vi-VN-HoaiMyNeural",
                         enableAutoSend = true,
                         autoSendDelay = 2000,
                         autoPlayAudio = true,
                         height = "80vh",
                         welcomeMessage = "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
                         // CẬP NHẬT: Nhận 2 hàm cập nhật trạng thái từ VirtualAssistant
                         setAiTalking = () => {},
                         setAiThinking = () => {}
                     }) => {

    const [messages, setMessages] = useState([
        {role: 'ai', type: 'text', content: welcomeMessage}
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // State cờ đánh dấu AI đang nói
    const [isAISpeaking, setIsAISpeaking] = useState(false);

    const messagesEndRef = useRef(null);
    const autoSendTimerRef = useRef(null);
    const isSendingRef = useRef(false);
    const latestInputRef = useRef(inputValue);

    // CẬP NHẬT: Báo cho component bên ngoài mỗi khi trạng thái nói thay đổi
    useEffect(() => {
        setAiTalking(isAISpeaking);
    }, [isAISpeaking, setAiTalking]);

    // MỚI: Báo cho component bên ngoài mỗi khi trạng thái suy nghĩ (loading) thay đổi
    useEffect(() => {
        setAiThinking(isLoading);
    }, [isLoading, setAiThinking]);

    useEffect(() => {
        latestInputRef.current = inputValue;
    }, [inputValue]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    // === HÀM GỬI TIN NHẮN (CHỐNG ĐÚP) ===
    const handleSendMessage = useCallback(async (textToSubmit = latestInputRef.current) => {
        // CHẶN GỬI ĐÚP: Nếu đang gửi, hoặc không có chữ, thì return luôn
        if (isSendingRef.current || !textToSubmit || !textToSubmit.trim()) return;

        // Đánh dấu là đang gửi (Khóa cửa / Bắt đầu suy nghĩ)
        isSendingRef.current = true;
        setIsLoading(true);

        // Xóa timer nếu có (để tránh timer thứ 2 nổ)
        if (autoSendTimerRef.current) {
            clearTimeout(autoSendTimerRef.current);
            autoSendTimerRef.current = null;
        }

        stopListening();

        // Thêm tin nhắn của User
        setMessages(prev => [...prev, {role: 'user', type: 'text', content: textToSubmit}]);
        setInputValue('');
        latestInputRef.current = ''; // Xóa luôn ref

        try {
            const response = await apiVoice.chat({
                text: textToSubmit,
                voice: voiceId
            });
            const data = response.data;

            if (data.code === 1000 && data.result) {
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'ai',
                        type: 'both',
                        content: data.result.text,
                        audioData: data.result.audioBase64
                    }
                ]);
            } else {
                setMessages(prev => [...prev, {role: 'ai', type: 'text', content: `Lỗi: ${data.message}`}]);
            }
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            setMessages(prev => [...prev, {role: 'ai', type: 'text', content: "Mất kết nối đến máy chủ."}]);
        } finally {
            // Mở khóa sau khi hoàn tất (Ngừng suy nghĩ)
            isSendingRef.current = false;
            setIsLoading(false);
        }
    }, [voiceId]);

    // === HOOK XỬ LÝ NHẬN DIỆN GIỌNG NÓI ===
    const {isListening, toggleListening, stopListening, error: micError} = useSpeechToText({
        onTranscript: (text) => {
            setInputValue(text);

            // --- LOGIC AUTO-SEND KHI IM LẶNG ---
            if (enableAutoSend && text.trim() !== '') {
                // Hủy bộ đếm cũ
                if (autoSendTimerRef.current) {
                    clearTimeout(autoSendTimerRef.current);
                }

                // Cài đặt bộ đếm mới
                autoSendTimerRef.current = setTimeout(() => {
                    // Chỉ gửi nếu lúc timer nổ mà không có tiến trình gửi nào đang chạy
                    if (!isSendingRef.current) {
                        handleSendMessage(text);
                    }
                }, autoSendDelay);
            }
        }
    });

    useEffect(() => {
        return () => {
            if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: height,
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid #ddd',
            borderRadius: '12px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>

            {/* Header */}
            <div style={{
                padding: '15px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{margin: 0, fontSize: '1.1rem'}}>{title}</h3>
                {micError && <span style={{fontSize: '0.8rem', color: '#fca5a5'}} title={micError}>⚠️ Lỗi Mic</span>}
            </div>

            {/* Vùng Chat */}
            <div style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                backgroundColor: '#f8fafc'
            }}>
                {messages.map((msg, index) => (
                    <div key={index}
                         style={{alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%'}}>

                        {/* Tin nhắn chữ thông thường */}
                        {msg.type === 'text' && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: msg.role === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                backgroundColor: msg.role === 'user' ? '#2563eb' : '#e2e8f0',
                                color: msg.role === 'user' ? 'white' : '#1e293b',
                                lineHeight: '1.5'
                            }}>
                                {msg.content}
                            </div>
                        )}

                        {/* Tin nhắn có cả chữ và âm thanh (AI trả về) */}
                        {msg.type === 'both' && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '15px 15px 15px 0',
                                backgroundColor: '#e2e8f0',
                                color: '#1e293b'
                            }}>
                                <div style={{marginBottom: '10px', lineHeight: '1.5'}}>{msg.content}</div>

                                {/* Bắt sự kiện thẻ audio để báo AI đang nói */}
                                <AudioPlayer
                                    base64Data={msg.audioData}
                                    autoPlay={autoPlayAudio}
                                    label="Nghe trả lời:"
                                    onPlay={() => setIsAISpeaking(true)}
                                    onPause={() => setIsAISpeaking(false)}
                                    onEnded={() => setIsAISpeaking(false)}
                                />
                            </div>
                        )}

                    </div>
                ))}

                {/* Trạng thái đang tải */}
                {isLoading && (
                    <div style={{
                        alignSelf: 'flex-start',
                        padding: '12px 16px',
                        borderRadius: '15px 15px 15px 0',
                        backgroundColor: '#e2e8f0',
                        color: '#64748b',
                        fontStyle: 'italic'
                    }}>
                        <span className="typing-indicator">⏳ Đang tổng hợp phản hồi...</span>
                    </div>
                )}
                <div ref={messagesEndRef}/>
            </div>

            {/* Vùng Nhập liệu */}
            <div style={{
                padding: '15px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: '0 0 12px 12px'
            }}>

                {/* Nút Mic đã được tách */}
                <MicButton
                    isListening={isListening}
                    onClick={toggleListening}
                    disabled={isLoading}
                    activeColor="#ef4444" // Đỏ
                    idleColor="#3b82f6"   // Xanh
                />

                <textarea
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        // Nếu tự gõ phím thì tắt auto-send timer đi để không gửi nhầm lúc đang gõ dở
                        if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Hãy nói gì đó..." : "Nhập câu hỏi hoặc bấm Mic..."}
                    rows="1"
                    style={{
                        flex: 1,
                        padding: '12px 15px',
                        borderRadius: '24px',
                        border: '1px solid #cbd5e1',
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '15px'
                    }}
                />

                <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '24px',
                        border: 'none',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        cursor: (isLoading || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        opacity: (isLoading || !inputValue.trim()) ? 0.5 : 1
                    }}
                >
                    Gửi
                </button>
            </div>
        </div>
    );
};

export default SmartChatAI;