import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei';

function Model({ url, position }) {
    const { scene, animations } = useGLTF(url);
    const { actions, names } = useAnimations(animations, scene);

    useEffect(() => {
        if (names.length > 0) {
            const animationName = names[0];
            actions[animationName].reset().fadeIn(0.5).play();
        }
    }, [actions, names]);

    return <primitive object={scene} scale={2} position={position} />;
}

export default function Ph_Annghen() {
    return (
        <div style={{ height: '100vh', width: '100vw', backgroundColor: '#e0e0e0' }}>
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }} shadows>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <Model url="/model/Ph-Annghen-Animation.glb" position={[0, -1.8, 0]} />
                </Suspense>

                <ContactShadows position={[0, -1.8, 0]} opacity={0.6} scale={5} blur={2.5} far={4} />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
}