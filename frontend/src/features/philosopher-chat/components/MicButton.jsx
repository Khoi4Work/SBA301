import React from 'react';

const MicButton = ({
                       isListening,
                       onClick,
                       disabled = false,
                       size = '45px',
                       activeColor = '#dc3545', // Màu khi đang thu âm (Đỏ)
                       idleColor = '#6c757d',   // Màu khi tắt (Xám)
                       disabledColor = '#cccccc',
                       customStyle = {},
                       className = ''
                   }) => {

    const getBackgroundColor = () => {
        if (disabled) return disabledColor;
        return isListening ? activeColor : idleColor;
    };

    return (
        <button
            className={`mic-button ${className}`}
            onClick={onClick}
            disabled={disabled}
            title={isListening ? "Đang nghe... Nhấn để dừng" : "Nhấn để nói"}
            style={{
                width: size,
                height: size,
                padding: '10px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: getBackgroundColor(),
                color: 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                ...customStyle
            }}
        >
            {isListening ? '🛑' : '🎤'}
        </button>
    );
};

export default MicButton;