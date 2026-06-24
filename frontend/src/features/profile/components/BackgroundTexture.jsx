import { useEffect, useState } from 'react';

export default function BackgroundTexture() {
    const [transform, setTransform] = useState('translate(0px, 0px)');

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            setTransform(`translate(${x * -10}px, ${y * -10}px) scale(1.05)`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className="paper-texture fixed inset-0 z-0 transition-transform duration-75 ease-out will-change-transform"
            style={{ transform }}
        />
    );
}
