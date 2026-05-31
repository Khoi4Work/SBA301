import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei';

function Model({ isTalking, isThinking }) {
    // 1. Load 3 file Model
    const { scene, animations: idleAnims } = useGLTF('/model/Ph-Annghen-Standing.glb');
    const { animations: talkAnims } = useGLTF('/model/Ph-Annghen-Animation.glb');
    const { animations: thinkAnims } = useGLTF('/model/Ph-Annghen-Thinking.glb'); // Load file Thinking

    // 2. Change name to easy call
    idleAnims[0].name = 'Idle';
    talkAnims[0].name = 'Talking';
    thinkAnims[0].name = 'Thinking';

    // 3. Combine 3 animation
    const { actions } = useAnimations([idleAnims[0], talkAnims[0], thinkAnims[0]], scene);

    // 4. Use useRef de default animation
    const currentAction = useRef('');

    useEffect(() => {
        // Define next animation
        let nextAction = 'Idle';
        if (isTalking) nextAction = 'Talking';
        else if (isThinking) nextAction = 'Thinking'

        // Statement check
        if (currentAction.current !== nextAction) {
            const actionToPlay = actions[nextAction];
            const actionToStop = actions[currentAction.current];

            if (actionToStop) actionToStop.fadeOut(0.5);
            if (actionToPlay) actionToPlay.reset().fadeIn(0.5).play();

            // Cập nhật lại hành động hiện tại
            currentAction.current = nextAction;
        }
    }, [isTalking, isThinking, actions]);

    return <primitive object={scene} scale={2} position={[0, -1.8, 0]} />;
}

export default function Ph_Annghen({ isTalking, isThinking }) {
    return (
        <div style={{ height: '100%', width: '100%', backgroundColor: '#e0e0e0' }}>
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }} shadows>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <Model isTalking={isTalking} isThinking={isThinking} />
                </Suspense>

                <ContactShadows position={[0, -1.8, 0]} opacity={0.6} scale={5} blur={2.5} far={4} />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
}

// Khai bao truoc 3 file
useGLTF.preload('/model/Ph-Annghen-Standing.glb');
useGLTF.preload('/model/Ph-Annghen-Animation.glb');
useGLTF.preload('/model/Ph-Annghen-Thinking.glb');