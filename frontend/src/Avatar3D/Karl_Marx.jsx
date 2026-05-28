import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei';

function Model({ isTalking }) {
    // 1. Load file gốc (chứa ngoại hình + hoạt ảnh Khoanh tay)
    const { scene, animations: idleAnimations } = useGLTF('/model/Karl-Marx-Standing.glb');

    // 2. Load THÊM file thứ 2 (Chỉ lấy hoạt ảnh Nói chuyện của nó)
    const { animations: talkAnimations } = useGLTF('/model/Karl-Marx-Animation.glb');

    // 3. Đổi tên 2 hoạt ảnh này cho dễ gọi
    idleAnimations[0].name = 'Idle';
    talkAnimations[0].name = 'Talking';

    // 4. Gộp 2 hoạt ảnh vào chung 1 mảng và bơm vào nhân vật gốc
    const { actions } = useAnimations([idleAnimations[0], talkAnimations[0]], scene);

    useEffect(() => {
        // Kiểm tra xem hành động nào cần chạy, hành động nào cần dừng
        const actionToPlay = isTalking ? actions['Talking'] : actions['Idle'];
        const actionToStop = isTalking ? actions['Idle'] : actions['Talking'];

        // Dừng hành động cũ từ từ trong 0.5 giây (để tay hạ xuống từ từ)
        if (actionToStop) {
            actionToStop.fadeOut(0.5);
        }

        // Bắt đầu hành động mới từ từ trong 0.5 giây
        if (actionToPlay) {
            actionToPlay.reset().fadeIn(0.5).play();
        }

    }, [isTalking, actions]); // Mỗi khi bấm nút đổi isTalking, useEffect này sẽ chạy lại

    return <primitive object={scene} scale={2} position={[0, -1.8, 0]} />;
}

export default function Karl_Marx() {
    const [isTalking, setIsTalking] = useState(false);

    return (
        <div style={{ height: '100vh', width: '100vw', backgroundColor: '#e0e0e0', position: 'relative' }}>

            {/* Nút bấm điều khiển */}
            <button
                onClick={() => setIsTalking(!isTalking)}
                style={{
                    position: 'absolute',
                    top: '30px',
                    left: '30px',
                    zIndex: 10,
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: isTalking ? '#ef4444' : '#10b981', // Đỏ khi nói, Xanh lá khi khoanh tay
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                {isTalking ? 'Dừng nói (Trở về khoanh tay)' : 'Bắt đầu thuyết trình'}
            </button>

            <Canvas camera={{ position: [0, 0, 4], fov: 50 }} shadows>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <Model isTalking={isTalking} />
                </Suspense>

                <ContactShadows position={[0, -1.8, 0]} opacity={0.6} scale={5} blur={2.5} far={4} />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
}

useGLTF.preload('/model/Karl-Marx-Standing.glb');
useGLTF.preload('/model/Karl-Marx-Animation.glb');