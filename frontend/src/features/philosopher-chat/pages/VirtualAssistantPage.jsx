import React, {useState, useRef, useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PhilosopherAvatar3D from '../components/PhilosopherAvatar3D.jsx';
import SmartChatAI from "@/features/philosopher-chat/components/SmartChatAI.jsx";
import MicButton from "@/features/philosopher-chat/components/MicButton.jsx";
import ChatPanel from "@/features/philosopher-chat/components/ChatPanel.jsx";
import { useSpeechToText } from '@/hooks/useSpeechToText.js';
import { Sidebar } from "@/components/Sidebar.jsx";
import { useSession } from '@/contexts/SessionContext.jsx';
import { philosopherService } from '@/services/philosopherService.js';
import "@/assets/styles/philoverse-chat.css";

const VirtualAssistantPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentPhilosopherId, setPhilosopherId, clearSession } = useSession();

    const [philosopherDetails, setPhilosopherDetails] = useState(location.state?.philosopher);
    const [isAiTalking, setIsAiTalking] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        if (location.state?.openChat) {
            setIsChatOpen(true);
        }
        // Reset trạng thái animation khi chuyển session/triết gia
        setIsAiTalking(false);
        setIsAiThinking(false);
    }, [location.state]);

    useEffect(() => {
        const fetchFullDetails = async () => {
            const statePhil = location.state?.philosopher;
            if (statePhil?.id && (!philosopherDetails?.idleModelUrl)) {
                try {
                    const fullDetails = await philosopherService.getById(statePhil.id);
                    if (fullDetails) {
                        setPhilosopherDetails(fullDetails);
                    }
                } catch (err) {
                    console.error("Failed to fetch philosopher details:", err);
                }
            }
        };
        fetchFullDetails();
    }, [location.state?.philosopher?.id, philosopherDetails]);

    useEffect(() => {
        if (philosopherDetails?.id) {
            if (currentPhilosopherId && currentPhilosopherId !== philosopherDetails.id) {
                clearSession();
            }
            setPhilosopherId(philosopherDetails.id);
        }
    }, [philosopherDetails?.id, currentPhilosopherId, setPhilosopherId, clearSession]);

    const chatRef = useRef(null);
    const autoSendTimerRef = useRef(null);

    // Voice Recognition Hook
    const { isListening, toggleListening, stopListening, error: micError } = useSpeechToText({
        continuous: false,
        onTranscript: (text) => {
            if (isAiTalking) return; // Cổng chặn: Bỏ qua thu âm khi AI đang nói
            if (chatRef.current) {
                chatRef.current.setInputValue(text);

                if (text.trim() !== '') {
                    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);

                    autoSendTimerRef.current = setTimeout(() => {
                        if (chatRef.current) {
                            chatRef.current.handleSendMessage(text);
                        }
                    }, 2000);
                }
            }
        }
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (isAiTalking && isListening) {
            stopListening();
        }
    }, [isAiTalking, isListening, stopListening]);

    const stopAllAudio = () => {
        const audios = document.querySelectorAll('audio');
        audios.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    };

    const handleMicClick = () => {
        stopAllAudio();
        if (isListening) {
            if (autoSendTimerRef.current) {
                clearTimeout(autoSendTimerRef.current);
                autoSendTimerRef.current = null;
            }
            if (chatRef.current) {
                chatRef.current.setInputValue('');
            }
        }
        toggleListening();
    };

    const navigateTo = (newView) => {
        if (newView === "selection") {
            navigate("/chat");
        }
    };

    return (
        <>
            <div className="noise-overlay fixed inset-0 z-[100]" />
            <div className="vignette fixed inset-0 z-30 pointer-events-none" />
            <div className="fixed inset-0 bg-surface-dim pointer-events-none z-[-1]" />
            <div className="fixed inset-0 atmospheric-fog z-[1]" />

            <Sidebar currentView="dialogue" onNavigate={navigateTo} />

            <main className="flex flex-col min-h-screen relative transition-all duration-500">
                {/*<TopBar*/}
                {/*    currentView="dialogue"*/}
                {/*    philosopherName={philosopher?.name || "Triết gia"}*/}
                {/*    onNavigate={navigateTo}*/}
                {/*/>*/}

                <div className="flex-1 transition-all duration-500 lg:ml-64 relative overflow-hidden">
                    <div className="flex justify-start pt-22 pl-6 relative z-20">
                        <p className="text-[11px] uppercase tracking-[0.4em] text-secondary/60">
                            Đàm đạo cùng {philosopherDetails?.name || "Triết gia"}
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        height: 'calc(100vh - 120px)',
                        width: '100%',
                        position: 'relative'
                    }}>

                        {/* Main View: Animation & Mic */}
                        <div style={{
                            flex: 1,
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}>
                            {(() => {
                                return <PhilosopherAvatar3D
                                    idleUrl={philosopherDetails?.idleModelUrl}
                                    talkingUrl={philosopherDetails?.talkingModelUrl}
                                    thinkingUrl={philosopherDetails?.thinkingModelUrl}
                                    isTalking={isAiTalking}
                                    isThinking={isAiThinking}
                                />;
                            })()}

                            <div style={{
                                position: 'absolute',
                                bottom: '40px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 10
                            }}>
                                <MicButton
                                    isListening={isListening}
                                    onClick={handleMicClick}
                                    disabled={isAiThinking}
                                    size="60px"
                                    activeColor="#ef4444"
                                    idleColor="#e9c176"
                                />
                            </div>
                        </div>

                        {/* Chat Sidebar using the new component */}
                        <ChatPanel
                            isOpen={isChatOpen}
                            onToggle={() => setIsChatOpen(!isChatOpen)}
                        >
                            <SmartChatAI
                                title={philosopherDetails?.name || "Trợ Lý Ảo Thông Minh"}
                            ref={chatRef}
                                visible={isChatOpen}
                                isListening={isListening}
                                toggleListening={toggleListening}
                                stopListening={stopListening}
                                micError={micError}
                                setAiTalking={setIsAiTalking}
                                setAiThinking={setIsAiThinking}
                                philosopherId={philosopherDetails?.id}
                            />
                        </ChatPanel>
                    </div>
                </div>
            </main>
        </>
    );
};

export default VirtualAssistantPage;
