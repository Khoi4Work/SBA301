import React from 'react';
import { MessageSquare, X } from 'lucide-react';

const ChatPanel = ({ children, isOpen, onToggle }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '450px',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            borderLeft: '1px solid rgba(0,0,0,0.1)',
            pointerEvents: isOpen ? 'all' : 'none', // Ngăn chặn tương tác khi đóng
        }}>
            <button
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    left: '-60px', // Đẩy ra xa hơn một chút để không bị dính
                    top: '20px',
                    zIndex: 110,
                    padding: '10px',
                    borderRadius: '50% 0 0 50%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '-2px 0 10px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'all', // Luôn cho phép bấm nút này
                }}
            >
                {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
            </button>

            <div style={{
                width: '100%',
                maxWidth: '500px',
                transition: 'opacity 0.2s ease',
                opacity: isOpen ? 1 : 0
            }}>
                {children}
            </div>
        </div>
    );
};

export default ChatPanel;
