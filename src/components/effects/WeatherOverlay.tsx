'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeatherOverlayProps {
    type: 'snow' | 'rain' | 'none';
    intensity?: number;
}

export const WeatherOverlay = React.memo(function WeatherOverlay({ type, intensity = 1 }: WeatherOverlayProps) {
    if (type === 'none') return null;

    return (
        <>
            <ambientLight intensity={type === 'rain' ? 0.2 : 0.4} />
            {type === 'snow' && <SnowEffect intensity={intensity} />}
            {type === 'rain' && <RainEffect intensity={intensity} />}
        </>
    );
});

function SnowEffect({ intensity }: { intensity: number }) {
    // User requested "200% more" -> Increased base count significantly (300 -> 800)
    const count = 800 * intensity;
    const mesh = useRef<THREE.InstancedMesh>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 40;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            const size = Math.random() > 0.8 ? 1.2 : 0.6 + Math.random() * 0.5;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, size, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        particles.forEach((particle, i) => {
            let { speed, xFactor, yFactor, zFactor, t } = particle;

            // NOTE: Removed "Wind/Sway" effect as requested by Army.
            // "Save the fluttering for windy/stormy days!" - Army
            // t = particle.t += speed / 2; 

            // Straight Downward Movement
            particle.my -= speed * 8;
            if (particle.my < -30) particle.my = 30;

            dummy.position.set(
                xFactor, // No sway (Math.cos removed)
                particle.my + yFactor,
                zFactor  // No sway
            );

            // Gentle rotation is okay
            dummy.rotation.set(
                Math.sin(t),
                Math.cos(t),
                0
            );

            dummy.scale.setScalar(particle.size);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            {/* 
        User requested: "White abundant snow like Kakao"
        Sphere geometry radius 0.15 => Diameter 0.3 fits well with size scaling.
      */}
            <sphereGeometry args={[0.15, 8, 8]} />
            {/* Pure white basic material for "Bright White" look (ignores lighting) */}
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.9}
            />
        </instancedMesh>
    );
}

function RainEffect({ intensity }: { intensity: number }) {
    const count = 300 * intensity;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            // ... Logic for rain ...
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;
            const speed = 0.5 + Math.random() * 0.5;
            temp.push({ x, y, z, speed });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!mesh.current) return;
        particles.forEach((p, i) => {
            p.y -= p.speed;
            if (p.y < -20) p.y = 20;
            dummy.position.set(p.x, p.y, p.z);
            dummy.rotation.x = 0;
            dummy.scale.set(0.05, 1.5, 0.05); // Thin rain streaks
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#aaccff" transparent opacity={0.6} />
        </instancedMesh>
    );
}
