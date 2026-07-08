import React, { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Model({ idleUrl, talkingUrl, thinkingUrl, isTalking, isThinking }) {
    // Load 3 files from Cloudinary URLs
    const { scene, animations: idleAnims } = useGLTF(idleUrl || '');
    const { animations: talkAnims } = useGLTF(talkingUrl || '');
    const { animations: thinkAnims } = useGLTF(thinkingUrl || '');

    // Rename animations to consistent labels
    useMemo(() => {
        if (idleAnims && idleAnims[0]) idleAnims[0].name = 'Idle';
        if (talkAnims && talkAnims[0]) talkAnims[0].name = 'Talking';
        if (thinkAnims && thinkAnims[0]) thinkAnims[0].name = 'Thinking';
    }, [idleAnims, talkAnims, thinkAnims]);

    // Combine animations
    const { actions } = useAnimations(
        [
            idleAnims?.[0],
            talkAnims?.[0],
            thinkAnims?.[0]
        ].filter(Boolean),
        scene
    );

    useEffect(() => {
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

export default function PhilosopherAvatar3D({ idleUrl, talkingUrl, thinkingUrl, isTalking, isThinking }) {
    if (!idleUrl && !talkingUrl && !thinkingUrl) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>Hiện tại nhân vật đang trong
        quá trình cập nhật, hiền giả vui lòng sử dụng nhân vật khác...</div>;
    }

    return (
        <div style={{ height: '100%', width: '100%', background: 'transparent', position: 'absolute', inset: 0 }}>
            <Canvas camera={{ position: [0, 1.5, 5.5], fov: 50 }} shadows>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <Model
                        idleUrl={idleUrl}
                        talkingUrl={talkingUrl}
                        thinkingUrl={thinkingUrl}
                        isTalking={isTalking}
                        isThinking={isThinking}
                    />
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
