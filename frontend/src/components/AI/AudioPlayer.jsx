import React, {useEffect, useRef, useState} from 'react';

const AudioPlayer = ({
                         base64Data,
                         autoPlay = true,
                         onEnded,
                         onPause,
                         onPlay,
                         showControls = true, // Cho phép ẩn hiện thanh audio control
                         label = '🎙️ AI Voice',
                         customStyle = {}
                     }) => {
    const audioRef = useRef(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (autoPlay && audioRef.current && base64Data) {
            audioRef.current.play().catch(err => {
                console.warn("Trình duyệt chặn autoplay:", err);
            });
        }
    }, [base64Data, autoPlay]);

    // Nếu không có data, không render thẻ audio để tránh lỗi NotSupportedError
    if (!base64Data || base64Data === 'undefined') {
        return null;
    }

    const handleEnded = () => {
        if (onEnded) onEnded();
    };

    const handlePlay = () => {
        if (onPlay) onPlay();
    };

    const handleError = () => {
        setError(true);
    };

    if (error) {
        return <span style={{color: 'red', fontSize: '12px'}}>⚠️ File âm thanh lỗi</span>;
    }

    return (
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', ...customStyle}}>
            {label && <span style={{fontSize: '14px', color: '#555', fontWeight: '500'}}>{label}</span>}
            <audio
                ref={audioRef}
                controls={showControls}
                src={`data:audio/mpeg;base64,${base64Data}`}
                onEnded={handleEnded}
                onPlay={handlePlay}
                onError={handleError}
                onPause={onPause}
                style={{
                    height: '35px',
                    width: '220px',
                    outline: 'none',
                    display: showControls ? 'block' : 'none'
                }}
            />
        </div>
    );
};

export default AudioPlayer;