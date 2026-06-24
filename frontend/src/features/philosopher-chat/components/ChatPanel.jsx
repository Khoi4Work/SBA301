import React from 'react';
import { MessageSquare, X } from 'lucide-react';

const ChatPanel = ({ children, isOpen, onToggle }) => {
    return (
        <div className={`absolute top-0 right-0 w-[450px] h-full bg-surface/80 backdrop-blur-md transition-transform duration-300 ease-in-out z-[100] flex flex-col items-center justify-center p-5 border-l ink-border ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
             style={{ pointerEvents: isOpen ? 'all' : 'none' }}>

            <button
                onClick={onToggle}
                className="absolute -left-[60px] top-5 z-[110] p-2.5 rounded-l-full bg-primary text-on-primary border-none cursor-pointer shadow-[-2px_0_10px_rgba(0,0,0,0.2)] flex items-center justify-center pointer-events-auto"
            >
                {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
            </button>

            <div className={`w-full max-w-[500px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                {children}
            </div>
        </div>
    );
};

export default ChatPanel;
