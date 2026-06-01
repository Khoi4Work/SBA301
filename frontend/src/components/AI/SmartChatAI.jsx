import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { apiVoice } from "@/services/apiVoice.js";
import AudioPlayer from './AudioPlayer.jsx';

const SmartChatAI = forwardRef(({
                         title = "Trợ Lý Ảo Thông Minh",
                         voiceId = "vi-VN-HoaiMyNeural",
                         autoPlayAudio = true,
                         height = "80vh",
                         welcomeMessage = "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
                         setAiTalking = () => {},
                         setAiThinking = () => {},
                         visible = true
                     }, ref) => {

    const [messages, setMessages] = useState([
        {role: 'ai', type: 'text', content: welcomeMessage}
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);

    const messagesEndRef = useRef(null);
    const isSendingRef = useRef(false);
    const latestInputRef = useRef(inputValue);

    useEffect(() => {
        setAiTalking(isAISpeaking);
    }, [isAISpeaking, setAiTalking]);

    useEffect(() => {
        setAiThinking(isLoading);
    }, [isLoading, setAiThinking]);

    useEffect(() => {
        latestInputRef.current = inputValue;
    }, [inputValue]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const handleSendMessage = useCallback(async (textToSubmit) => {
        const finalText = textToSubmit || latestInputRef.current;
        if (isSendingRef.current || !finalText || !finalText.trim()) return;

        isSendingRef.current = true;
        setIsLoading(true);

        setMessages(prev => [...prev, {role: 'user', type: 'text', content: finalText}]);
        setInputValue('');
        latestInputRef.current = '';

        try {
            const response = await apiVoice.chat({
                text: finalText,
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
            isSendingRef.current = false;
            setIsLoading(false);
        }
    }, [voiceId]);

    useImperativeHandle(ref, () => ({
        handleSendMessage,
        setInputValue,
        getInputValue: () => latestInputRef.current
    }));

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div style={{
            display: visible ? 'flex' : 'none', // Sử dụng display: none thay vì opacity để không chiếm không gian/can thiệp UI
            flexDirection: 'column',
            height: height,
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid #ddd',
            borderRadius: '12px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
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

                        {msg.type === 'both' && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '15px 15px 15px 0',
                                backgroundColor: '#e2e8f0',
                                color: '#1e293b'
                            }}>
                                <div style={{marginBottom: '10px', lineHeight: '1.5'}}>{msg.content}</div>

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
                <div ref={messagesEndRef}></div>
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

                <textarea
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        latestInputRef.current = e.target.value;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi hoặc bấm Mic..."
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
});

export default SmartChatAI;
