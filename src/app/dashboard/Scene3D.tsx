'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    Text,
    Float,
    MeshWobbleMaterial,
    Environment,
    ContactShadows,
    PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';

function AdelineAvatar() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.1;
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh
                ref={meshRef}
                scale={active ? 1.5 : 1}
                onClick={() => setActive(!active)}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                castShadow
            >
                <boxGeometry args={[1, 1, 1]} />
                <MeshWobbleMaterial
                    color={hovered ? '#fbbf24' : '#87A878'}
                    factor={0.4}
                    speed={2}
                />
            </mesh>
            <Text
                position={[0, 1.2, 0]}
                fontSize={0.2}
                color="#374151"
                anchorX="center"
                anchorY="middle"
            >
                {active ? "Yay! 3D Mode!" : "Click Me!"}
            </Text>
        </Float>
    );
}

function LearningGem({ position, color }: { position: [number, number, number], color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.02;
        }
    });

    return (
        <mesh ref={meshRef} position={position} castShadow>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
    );
}

export default function Scene3D() {
    return (
        <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white rounded-2xl overflow-hidden shadow-inner relative border-4 border-white">
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-white shadow-sm pointer-events-none">
                <h3 className="text-sm font-bold text-slate-800">3D Playground Mode</h3>
                <p className="text-xs text-slate-500">Rotate, zoom, and interact!</p>
            </div>

            <Canvas shadows camera={{ position: [0, 2, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
                <pointLight position={[-10, -10, -10]} />

                <PresentationControls
                    global
                    config={{ mass: 2, tension: 500 }}
                    snap={{ mass: 4, tension: 1500 }}
                    rotation={[0, 0.3, 0]}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                >
                    <AdelineAvatar />

                    <LearningGem position={[-2, 0, -1]} color="#f472b6" />
                    <LearningGem position={[2, 0.5, -2]} color="#60a5fa" />
                    <LearningGem position={[-1.5, -1, 1]} color="#fbbf24" />
                </PresentationControls>

                <ContactShadows
                    position={[0, -1.5, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2.5}
                    far={4}
                />

                <Environment preset="city" />
                <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={10} />
            </Canvas>
        </div>
    );
}
