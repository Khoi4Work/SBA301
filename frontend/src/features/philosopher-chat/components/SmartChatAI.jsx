import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { apiVoice } from "@/services/apiVoice.js";
import { apiChatHistory } from "@/services/chatHistoryService.js";
import AudioPlayer from './AudioPlayer.jsx';
import { useSession } from '@/contexts/SessionContext.jsx';
import {apiRag} from "@/services/apiRag.js";

const SmartChatAI = forwardRef(({
                         title = "Trợ Lý Ảo Thông Minh",
                         voiceId = "vi-VN-HoaiMyNeural",
                         philosopherId = null,
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

    const { currentSessionId, setSessionId, triggerRefresh } = useSession();
    const prevSessionIdRef = useRef(null);
    const justReceivedResponseRef = useRef(false);

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
        const loadHistory = async () => {
            if (!currentSessionId) return;

            try {
                const response = await apiChatHistory.getSessionHistory(currentSessionId);
                const data = response.data;

                if (data.code === 1000 && data.result) {
                    const history = data.result;
                    if (history.length === 0) {
                        setMessages([{role: 'ai', type: 'text', content: welcomeMessage}]);
                    } else {
                        const formattedMessages = [];
                        history.forEach(item => {
                            formattedMessages.push({role: 'user', type: 'text', content: item.query});
                            formattedMessages.push({role: 'ai', type: 'text', content: item.response});
                        });
                        setMessages(formattedMessages);
                    }
                } else {
                    setMessages([{role: 'ai', type: 'text', content: welcomeMessage}]);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử hội thoại:", error);
                setMessages([{role: 'ai', type: 'text', content: welcomeMessage}]);
            }
        };

        if (!currentSessionId) {
            setMessages([{role: 'ai', type: 'text', content: welcomeMessage}]);
        } else if (prevSessionIdRef.current !== currentSessionId) {
            if (justReceivedResponseRef.current) {
                justReceivedResponseRef.current = false;
            } else {
                loadHistory();
            }
        }

        prevSessionIdRef.current = currentSessionId;
    }, [currentSessionId]);

    useEffect(() => {
        latestInputRef.current = inputValue;
    }, [inputValue]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const handleSendMessage = useCallback(async (textToSubmit) => {
        const finalText = textToSubmit || latestInputRef.current;
        if (isSendingRef.current || !finalText || !finalText.trim()) return;

        // Ngắt tất cả âm thanh đang phát trước khi gửi tin nhắn mới
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        isSendingRef.current = true;
        setIsLoading(true);

        setMessages(prev => [...prev, {role: 'user', type: 'text', content: finalText}]);
        setInputValue('');
        latestInputRef.current = '';

        try {
            const response = await apiRag.ask({
                query: finalText,
                philosopherId: philosopherId,
                sessionId: currentSessionId
            });
            const data = response.data;

            if (data.code === 1000 && data.result) {
                // Lưu lại sessionId mới từ backend (hoặc session hiện tại)
                const effectiveSessionId = data.result.sessionId || currentSessionId;
                if (data.result.sessionId) {
                    console.log("Saving session Id" + data.result.sessionId);
                    justReceivedResponseRef.current = true;
                    setSessionId(data.result.sessionId);
                }
                triggerRefresh();
                const params = new URLSearchParams({
                    text: data.result.answer,
                    voice: voiceId,
                    philosopherId: philosopherId,
                    sessionId: effectiveSessionId
                });
                const streamUrl = `http://localhost:8080/api/voice/speak?${params.toString()}`;
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'ai',
                        type: 'both',
                        content: data.result.answer,
                        audioData: streamUrl
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
    }, [voiceId, philosopherId, currentSessionId]);

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
        <div style={{ display: visible ? 'flex' : 'none', height: height }}
             className="flex flex-col max-w-[600px] mx-auto border border-outline-variant rounded-xl bg-surface-container shadow-xl transition-all duration-300">

            {/* Header */}
            <div className="p-4 px-5 bg-surface-container-high text-primary rounded-t-xl flex justify-between items-center">
                <h3 className="m-0 text-lg font-display">{title}</h3>
            </div>

            {/* Vùng Chat */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 parchment-gradient scroll-hide">
                {messages.map((msg, index) => (
                    <div key={index}
                         className={`self-auto max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>

                        {msg.type === 'text' && (
                            <div className={`p-3 px-4 rounded-2xl leading-relaxed ${
                                msg.role === 'user'
                                ? 'rounded-br-none bg-primary text-on-primary'
                                : 'rounded-bl-none bg-surface-container-high text-on-surface'
                            }`}>
                                {msg.content}
                            </div>
                        )}

                        {msg.type === 'both' && (
                            <div className="p-3 px-4 rounded-2xl rounded-bl-none bg-surface-container-high text-on-surface leading-relaxed">
                                <div className="mb-2.5 leading-relaxed">{msg.content}</div>

                                <AudioPlayer
                                    audioUrl={msg.audioData}
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
                    <div className="self-start p-3 px-4 rounded-2xl rounded-bl-none bg-surface-container-low text-on-surface-variant italic">
                        <span className="typing-indicator">⏳ Đang tổng hợp phản hồi...</span>
                    </div>
                )}
                <div ref={messagesEndRef}></div >
            </div>

            {/* Vùng Nhập liệu */}
            <div className="p-4 border-t border-outline-variant flex gap-2.5 items-center bg-surface-container rounded-b-xl">

                <textarea
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        latestInputRef.current = e.target.value;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi hoặc bấm Mic..."
                    rows="1"
                    className="flex-1 p-3 px-4 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface resize-none outline-none font-sans text-sm focus:border-secondary transition-colors"
                />

                <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-5 py-2.5 rounded-full border-none bg-secondary text-on-secondary cursor-pointer font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
});

export default SmartChatAI;
