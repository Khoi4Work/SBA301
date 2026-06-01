import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Model({ isTalking, isThinking }) {
    // 1. Load 3 file Model
    const { scene, animations: idleAnims } = useGLTF('/model/Ph-Annghen-Standing.glb');
    const { animations: talkAnims } = useGLTF('/model/Ph-Annghen-Animation.glb');
    const { animations: thinkAnims } = useGLTF('/model/Ph-Annghen-Thinking.glb');

    // 2. Change name to easy call
    idleAnims[0].name = 'Idle';
    talkAnims[0].name = 'Talking';
    thinkAnims[0].name = 'Thinking';

    // 3. Combine 3 animation
    const { actions } = useAnimations([idleAnims[0], talkAnims[0], thinkAnims[0]], scene);

    // 4. Xử lý Animation chuẩn bằng Cleanup Function
    useEffect(() => {
        // Xác định hành động hiện tại
        let currentAction = 'Idle';
        if (isTalking) currentAction = 'Talking';
        else if (isThinking) currentAction = 'Thinking';

        const action = actions[currentAction];

        if (action) {
            action.reset().fadeIn(0.0001).play();
            action.setLoop(THREE.LoopRepeat, Infinity);
        }

        return () => {
            if (action) {
                action.fadeOut(0.5);
            }
        };
    }, [isTalking, isThinking, actions]);

    return <primitive object={scene} scale={2} position={[0, -1.5, 0]} />;
}

export default function Ph_Annghen({ isTalking, isThinking }) {
    return (
        <div style={{ height: '100%', width: '100%', background: 'transparent', position: 'absolute', inset: 0 }}>
            <Canvas camera={{ position: [0, 1.5, 5.5], fov: 50 }} shadows>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <Model isTalking={isTalking} isThinking={isThinking} />
                </Suspense>

                <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={5} blur={2.5} far={4} color="#000000" />

                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    maxPolarAngle={Math.PI / 2}
                    target={[0, 1, 0]}
                />
            </Canvas>
        </div>
    );
}

// Khai báo trước 3 file
useGLTF.preload('/model/Ph-Annghen-Standing.glb');
useGLTF.preload('/model/Ph-Annghen-Animation.glb');
useGLTF.preload('/model/Ph-Annghen-Thinking.glb');