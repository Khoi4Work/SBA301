import React, { useState } from 'react';
import Ph_Annghen from '../Avatar3D/Ph_Annghen';
import SmartChatAI from "@/components/AI/SmartChatAI.jsx";

const VirtualAssistant = () => {
    const [isAiTalking, setIsAiTalking] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false); // Thêm trạng thái Suy nghĩ

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <div style={{ flex: 6, position: 'relative' }}>
                {/* Truyền cả 2 trạng thái xuống Avatar */}
                <Ph_Annghen isTalking={isAiTalking} isThinking={isAiThinking} />
            </div>

            <div style={{ flex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#f0f2f5' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    {/* Truyền cả 2 hàm set trạng thái xuống khung Chat */}
                    <SmartChatAI setAiTalking={setIsAiTalking} setAiThinking={setIsAiThinking} />
                </div>
            </div>
        </div>
    );
};

export default VirtualAssistant;