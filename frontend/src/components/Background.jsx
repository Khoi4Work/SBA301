import { useEffect, useRef } from 'react';

export function Background() {
    const imgRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!imgRef.current) return;

            const amount = 15;
            const x = (e.clientX / window.innerWidth - 0.5) * amount;
            const y = (e.clientY / window.innerHeight - 0.5) * amount;

            imgRef.current.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 noise-bg" />

            <img
                ref={imgRef}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHWzgwN5dCPjT4V8b1V7p5QIcf_88Co5d9pzCLVCczt2bggBcD2VyJW1aUFWobRbQCwjGhfbpIn6fTje5QMlKvIYsymESGPDlPqhooa_TLbVFQNflKP3HyeGUwsp-XJOW2s6m_QirpXoAZibqbHd3sZG0caPLrOJWrvashraViAkdUJ8_Ke18XgF2lkHI314Tvf5iM-nhugTL_u4jnMw69jxGU37slhvW_Iz5mSYW7mfHgaNr5EZsdATIoPfhNRNkO4YZ0eXsBCv4"
                alt="Library Background"
                className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-50 transition-transform duration-200 ease-out"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>
    );
}