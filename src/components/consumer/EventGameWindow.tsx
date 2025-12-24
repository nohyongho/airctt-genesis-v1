'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Sparkles,
    PerspectiveCamera,
    Environment,
    MeshTransmissionMaterial
} from '@react-three/drei';
import * as THREE from 'three';

import { walletService } from '@/lib/wallet-service';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherOverlay } from '@/components/effects/WeatherOverlay';

interface FallingGemProps {
    id: number;
    position: [number, number, number];
    color: string;
    scale: number;
    shape: 'dodecahedron' | 'octahedron' | 'icosahedron';
    onInteraction: (id: number) => void;
}

const FallingGem = React.memo(function FallingGem({ id, position, color, scale: gemScale, shape, onInteraction }: FallingGemProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Falling physics applied to the GROUP (so hit box moves with gem)
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Fall down
            groupRef.current.position.y -= delta * 1.5; // Speed

            // Rotate
            groupRef.current.rotation.x += delta;
            groupRef.current.rotation.y += delta * 0.5;

            // Reset if out of view
            if (groupRef.current.position.y < -4) {
                groupRef.current.position.y = 4 + Math.random() * 2;
                groupRef.current.position.x = (Math.random() - 0.5) * 3;
            }
        }
    });

    const Geometry = shape === 'dodecahedron' ? THREE.DodecahedronGeometry :
        shape === 'octahedron' ? THREE.OctahedronGeometry :
            THREE.IcosahedronGeometry;

    return (
        <group ref={groupRef} position={position}>
            {/* Invisible Hit Box (Larger) - Must be visible=true but transparent for raycast */}
            <mesh onClick={() => onInteraction(id)}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Visible Gem */}
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? gemScale * 1.2 : gemScale} // Use random scale
            >
                <primitive object={new Geometry(0.8, 0)} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.5}
                    chromaticAberration={0.1}
                    anisotropy={0.1}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.2}
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                    toneMapped={true}
                />
            </mesh>
        </group>
    );
});


function Snow() {
    const count = 200;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            // Update time
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            // Movement
            particle.my -= speed * 10; // Downward
            if (particle.my < -5) particle.my = 5; // Reset

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                particle.my + yFactor + (Math.sin((t / 10) * factor) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.setScalar(s * 0.5 + 0.5); // Pulse size
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.12, 8, 8]} /> {/* Larger snowballs (2.4x) */}
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </instancedMesh>
    );
}

function Explosion({ position, color }: { position: [number, number, number], color: string }) {
    return (
        <group position={position}>
            {/* Core Burst - Firework Style */}
            <Sparkles
                count={40}
                scale={2.5}
                size={8}
                speed={2}
                opacity={1}
                color={color}
                noise={0.5}
            />
            {/* Outer Sparkles - Wide Spread */}
            <Sparkles
                count={30}
                scale={4}
                size={4}
                speed={1}
                opacity={0.6}
                color="#FFF"
                noise={1}
            />
        </group>
    );
}

interface EventGameWindowProps {
    onCouponAcquired: (amount: number, name: string) => void;
    onClose?: () => void;
    lang: 'ko' | 'en';
}

export default function EventGameWindow({ onCouponAcquired, onClose, lang }: EventGameWindowProps) {
    // Generate random gems
    const initialGems = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        pos: [(Math.random() - 0.5) * 3, 4 + Math.random() * 5, (Math.random() - 0.5) * 2] as [number, number, number],
        color: ['#FF3D00', '#00C853', '#2962FF', '#FFD600', '#AA00FF'][Math.floor(Math.random() * 5)],
        scale: 0.2 + Math.random() * 0.3, // Random scale between 0.2 and 0.5
        shape: ['dodecahedron', 'octahedron', 'icosahedron'][Math.floor(Math.random() * 3)] as any,
    })), []);

    const [gems, setGems] = useState(initialGems);
    const [score, setScore] = useState(0);
    const [acquiredCount, setAcquiredCount] = useState(0);
    const [showReward, setShowReward] = useState(false);
    const [lastReward, setLastReward] = useState('');
    const [winTier, setWinTier] = useState(0); // New State for Tier
    const [explosions, setExplosions] = useState<{ id: number; position: [number, number, number]; color: string }[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [isDownloading, setIsDownloading] = useState(true);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // New State for Anticipation Logic
    const [previewMode, setPreviewMode] = useState(false);
    const [previewTier, setPreviewTier] = useState(0);
    const [canInteract, setCanInteract] = useState(false); // Ghost click prevention

    // Audio Refs for managing playback
    const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            stopAllSounds();
        };
    }, []);

    // Simulate Downloading Assets
    useEffect(() => {
        if (!isDownloading) return;

        // Instant start logic based on user request ("First click doesn't open? Open immediately")
        // We will make the download fake but really fast or just visual
        const interval = setInterval(() => {
            setDownloadProgress(prev => {
                const next = prev + 5; // Faster download
                if (next >= 100) {
                    clearInterval(interval);
                    setIsDownloading(false);
                    // Enable interaction after a short delay to prevent 'ghost clicks' from map
                    setTimeout(() => setCanInteract(true), 800);
                    return 100;
                }
                return next;
            });
        }, 20); // Faster interval

        return () => clearInterval(interval);
    }, [isDownloading]);

    const t = {
        title: lang === 'ko' ? '보석 잡기' : 'GEM CATCH',
        desc: lang === 'ko' ? '떨어지는 보석을 터치하세요!' : 'Touch the falling gems!',
        score: lang === 'ko' ? '점수' : 'Score',
        coupons: lang === 'ko' ? 'Coupons' : 'Coupons',
        saving: lang === 'ko' ? '저장 중...' : 'Saving...',
        luckyWin: lang === 'ko' ? '당첨!' : 'LUCKY WIN!',
        discount: lang === 'ko' ? '할인 쿠폰' : 'Discount Coupon', // Removed '10%' hardcode
        close: lang === 'ko' ? '닫기' : 'CLOSE',
    };

    const stopAllSounds = () => {
        // Stop all currently playing sounds in our ref
        Object.values(audioRef.current).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        // Clear any pending sound triggers
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };

    const playSound = (type: 'tok' | 'pung' | 'tada' | 'congrats') => {
        // For 'tok', we allow overlap (don't stop others)
        // For win sequence sounds, we might want to manage them

        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.volume = 0.5;

        // If it's a long sound like congrats, store it to stop later
        if (type === 'congrats' || type === 'pung') {
            audioRef.current[type] = audio;
        }

        audio.play().catch(() => { });
    };

    // Weighted Coupon Draw Logic
    const drawCoupon = () => {
        // Total pool: 400. Win: 100. Loss: 300.
        const rand = Math.floor(Math.random() * 400);

        // 0-299: Loss (300 items)
        if (rand < 300) return null;

        // 300-399: Wins (100 items)
        // Adjust rand to 0-99 range for easier mapping
        const winRand = rand - 300;

        // Cumulative mapping for 100 items:
        // 10% (20 items): 0-19
        // 20% (10 items): 20-29
        // 30% (15 items): 30-44
        // 40% (10 items): 45-54
        // 50% (10 items): 55-64
        // 60% (10 items): 65-74
        // 70% (8 items): 75-82
        // 80% (7 items): 83-89
        // 90% (6 items): 90-95
        // 100% (4 items): 96-99

        if (winRand < 20) return 10;
        if (winRand < 30) return 20;
        if (winRand < 45) return 30;
        if (winRand < 55) return 40;
        if (winRand < 65) return 50;
        if (winRand < 75) return 60;
        if (winRand < 83) return 70;
        if (winRand < 90) return 80;
        if (winRand < 96) return 90;
        return 100;
    };

    const finalizeWin = (winPercent: number) => {
        setPreviewMode(false);

        // STOP previous sounds
        stopAllSounds();

        // WIN SEQUENCE
        playSound('pung');

        // Sound intensity based on tier
        if (winPercent === 100) {
            setTimeout(() => playSound('congrats'), 400); // Grand prize sound
        } else if (winPercent >= 50) {
            setTimeout(() => playSound('congrats'), 500);
        } else {
            setTimeout(() => playSound('tada'), 500);
        }

        setWinTier(winPercent); // Set the tier for UI rendering
        setLastReward(`${winPercent}% OFF`);
        setShowReward(true);
        setScore(prev => prev + 1000 * (winPercent / 10));
        setAcquiredCount(prev => prev + 1);
        onCouponAcquired(1000, t.luckyWin);

        // Save to Wallet with Metadata
        walletService.addCoupon({
            title: `${winPercent}% Discount Coupon`,
            description: `Event Reward: ${winPercent}% OFF`,
            brand: 'AIRCTT ANT 백화점',
            imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200',
            discountRate: winPercent,
            issuerInfo: {
                name: '(주)발로레',
                brand: 'AIRCTT ANT 백화점',
                mobile: '010-987-1234',
                email: 'eus1408324@gmail.com',
                regNo: '277-87-01333',
                corpName: '주식회사 발로레',
                ceo: '오현실',
                corpRegNo: '110111-60614',
                address: '서울특별시 서초구 반포대로94길 71, 716호(서초동, 서초트)'
            }
        });
    };

    const handleInteraction = (id: number, position: [number, number, number], color: string) => {
        if (!canInteract) return; // Prevent interaction if not ready
        if (!gameStarted) setGameStarted(true);

        // Trigger Explosion
        const explosionId = Date.now();
        setExplosions(prev => [...prev, { id: explosionId, position, color }]);
        setTimeout(() => {
            setExplosions(prev => prev.filter(e => e.id !== explosionId));
        }, 300);

        // Weighted Draw
        const winPercent = drawCoupon();

        if (winPercent !== null) {
            // Success Logic
            if (winPercent >= 50) {
                // High Tier -> Trigger Anticipation Sequence
                setPreviewMode(true);
                setPreviewTier(winPercent);
                const delay = winPercent === 100 ? 5000 : (winPercent >= 70 ? 3000 : 2000);
                setTimeout(() => finalizeWin(winPercent), delay);
            } else {
                finalizeWin(winPercent);
            }

            // --- API INTEGRATION START ---
            // 1. Start Game Session (if not already tracked properly, but here we treat interaction as a "mini-game" or session conclusion)
            // For MVP: We assume one "click" that wins is a successful "session".

            // NOTE: In a real app, you might start the session on Component Mount. 
            // Here we treat the 'Win' interaction as the critical moment to record.

            // Simulate Consumer ID (In real app, get from Context/Auth)
            const consumerIdMock = '00000000-0000-0000-0000-000000000000'; // Replace with real ID later

            (async () => {
                try {
                    // A. Start Session
                    const startRes = await fetch('/api/game/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            consumer_id: consumerIdMock,
                            game_type: 'BUBBLE_5STEP_V1'
                        })
                    });
                    const startData = await startRes.json();

                    if (startData.session_id) {
                        // B. Finish Session (Report Success)
                        const finishRes = await fetch('/api/game/finish', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                session_id: startData.session_id,
                                steps_cleared: 5,
                                success: true,
                                client_info: { win_percent: winPercent }
                            })
                        });
                        const finishData = await finishRes.json();

                        if (finishData.reward_id) {
                            // C. Claim Reward (Issue Coupon/Points)
                            await fetch('/api/rewards/claim', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reward_id: finishData.reward_id })
                            });
                            console.log('Reward Claimed via API');
                        }
                    }
                } catch (e) {
                    console.error('Game API Error (Mock Mode Active):', e);
                }
            })();
            // --- API INTEGRATION END ---

        } else {
            // NORMAL CLICK / LOSS
            playSound('tok');
            setScore(prev => prev + 10);
        }

        // Respawn gem
        setGems(prev => prev.map(g => {
            if (g.id === id) {
                return {
                    ...g,
                    pos: [(Math.random() - 0.5) * 3, 5 + Math.random() * 2, (Math.random() - 0.5) * 2]
                };
            }
            return g;
        }));
    };

    return (
        <div
            className="w-full h-full bg-gradient-to-b from-blue-900 via-purple-900 to-black overflow-hidden shadow-2xl relative"
        >
            {/* Green LED Close Button - Top Right */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[999] group"
                >
                    <div className="relative bg-black/40 backdrop-blur-md border border-[#00C853]/50 rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_0_15px_rgba(0,200,83,0.3)] transition-all group-active:scale-95 group-hover:shadow-[0_0_25px_rgba(0,200,83,0.6)]">
                        <div className="w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_10px_#00C853] animate-pulse" />
                        <span className="text-[#00C853] font-bold text-sm tracking-widest">{t.close}</span>
                    </div>
                </button>
            )}

            {/* Scoreboard - Top Left (Reduced to 50%) */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none origin-top-left scale-[0.5]">
                <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex gap-4 shadow-xl">
                    <div className="text-center min-w-[60px]">
                        <div className="text-[10px] sm:text-xs text-gray-300 font-bold uppercase tracking-wider">{t.score}</div>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono">{score.toLocaleString()}</div>
                    </div>
                    <div className="w-px bg-white/20" />
                    <div className="text-center min-w-[60px]">
                        <div className="text-[10px] sm:text-xs text-gray-300 font-bold uppercase tracking-wider">{t.coupons}</div>
                        <div className="text-xl sm:text-2xl font-black text-[#FFD600] font-mono">{acquiredCount}</div>
                    </div>
                </div>
            </div>

            {/* Download Indicator */}
            {isDownloading && (
                <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center">
                    <div className="text-white text-xl font-bold mb-6 animate-pulse tracking-widest">DOWNLOADING ASSETS...</div>
                    <div className="w-72 h-8 bg-black rounded-lg border border-gray-700 p-1 relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                        <div className="absolute inset-0 z-20 bg-[url('/grid.png')] opacity-20 pointer-events-none" />
                        <div
                            className="h-full bg-gradient-to-r from-[#00C853] to-[#69F0AE] rounded shadow-[0_0_15px_#00C853] transition-all duration-75 ease-out relative"
                            style={{ width: `${downloadProgress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#00C853] rounded-full animate-ping" />
                        <div className="text-[#00C853] font-mono font-bold text-lg">{downloadProgress}%</div>
                    </div>
                </div>
            )}

            {/* Reward Interface */}
            {showReward && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
                    {/* Light Burst Background */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        className="absolute w-full h-full bg-gradient-to-r from-yellow-500/20 to-purple-500/20 blur-3xl"
                    />

                    <div className="relative w-full h-full flex flex-col items-center justify-center pb-20">

                        {/* Title Text */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute top-20 z-50 text-center"
                        >
                            <motion.h2
                                className="text-4xl xs:text-5xl font-black text-transparent bg-clip-text drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-text"
                                animate={{
                                    backgroundImage: [
                                        "linear-gradient(to bottom, #00C853, #fff)", // Green
                                        "linear-gradient(to bottom, #FFD600, #fff)", // Yellow
                                        "linear-gradient(to bottom, #FF3D00, #fff)", // Red
                                        "linear-gradient(to bottom, #00C853, #fff)"  // Loop
                                    ]
                                }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                {t.luckyWin}
                            </motion.h2>
                            <p className="text-[#FFD600] font-bold text-xl mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {lastReward}
                            </p>
                        </motion.div>

                        {/* Visuals Container - Single Composite Image */}
                        <div className="relative flex flex-col items-center justify-center mt-8">

                            {/* Composite Image (Rabbit + Child in Cup) */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.5, duration: 1.2 }}
                                className="relative z-30"
                            >
                                <motion.img
                                    src="/rabbit_cup_composite.png"
                                    alt="Rabbit and Child in Cup"
                                    className="w-64 h-64 object-contain drop-shadow-2xl"
                                    animate={{
                                        // Pendulum Swing (Left-Right Sway)
                                        rotate: [0, 10, 0, -10, 0],
                                        y: [0, -5, 0] // Gentle bob
                                    }}
                                    transition={{
                                        rotate: {
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        },
                                        y: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }}
                                />
                            </motion.div>

                            {/* Coupon - Immediately Below - Reduced Size (50%) & Transparent */}
                            <AnimatePresence>
                                <motion.div
                                    initial={{ scale: 0, opacity: 0, y: -20 }}
                                    animate={{
                                        scale: [0, 0.6, 0.5], // Reduced scale to 50%
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        x: typeof window !== 'undefined' ? -window.innerWidth / 2 + 80 : -100,
                                        y: typeof window !== 'undefined' ? -window.innerHeight / 2 + 80 : -100,
                                        scale: 0.2,
                                        opacity: 0,
                                        transition: { duration: 0.8, ease: "backIn" }
                                    }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="z-50 mt-2"
                                >
                                    {/* Coupon Card with Dynamic Tier Styles */}
                                    {(() => {
                                        // Determine styles based on winTier
                                        let borderColors = ["#B0BEC5", "#78909C"]; // Default Silver
                                        let glowColor = "rgba(176, 190, 197, 0.5)";
                                        let textColor = "#B0BEC5";

                                        if (winTier === 100) { // Diamond/Rainbow
                                            borderColors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"];
                                            glowColor = "rgba(255, 255, 255, 0.8)";
                                            textColor = "#FFFFFF";
                                        } else if (winTier >= 90) { // Gold Extreme
                                            borderColors = ["#FFD700", "#FFAB00", "#FFEA00"];
                                            glowColor = "rgba(255, 215, 0, 0.7)";
                                            textColor = "#FFD700";
                                        } else if (winTier >= 80) { // Gold
                                            borderColors = ["#FFC107", "#FFB300"];
                                            glowColor = "rgba(255, 193, 7, 0.6)";
                                            textColor = "#FFC107";
                                        } else if (winTier >= 70) { // Purple Neon
                                            borderColors = ["#D500F9", "#AA00FF"];
                                            glowColor = "rgba(213, 0, 249, 0.6)";
                                            textColor = "#E040FB";
                                        } else if (winTier >= 60) { // Blue Neon
                                            borderColors = ["#2962FF", "#2979FF"];
                                            glowColor = "rgba(41, 98, 255, 0.6)";
                                            textColor = "#448AFF";
                                        } else if (winTier >= 50) { // Cyan
                                            borderColors = ["#00B0FF", "#00E5FF"];
                                            glowColor = "rgba(0, 176, 255, 0.6)";
                                            textColor = "#18FFFF";
                                        } else if (winTier >= 40) { // Green High
                                            borderColors = ["#00C853", "#64DD17"];
                                            glowColor = "rgba(0, 200, 83, 0.6)";
                                            textColor = "#69F0AE";
                                        } else if (winTier >= 30) { // Green Mid
                                            borderColors = ["#00E676", "#B9F6CA"];
                                            glowColor = "rgba(0, 230, 118, 0.5)";
                                            textColor = "#00E676";
                                        } else if (winTier >= 20) { // Bronze
                                            borderColors = ["#D84315", "#FF8A65"];
                                            glowColor = "rgba(216, 67, 21, 0.5)";
                                            textColor = "#FFAB91";
                                        }

                                        return (
                                            <motion.div
                                                className="relative group perspective-1000 origin-top"
                                                style={{ borderRadius: '1rem' }}
                                                animate={{
                                                    boxShadow: [
                                                        `0 0 20px ${glowColor}`,
                                                        `0 0 40px ${glowColor}`,
                                                        `0 0 20px ${glowColor}`
                                                    ]
                                                }}
                                                transition={{ duration: winTier >= 70 ? 0.5 : 1.5, repeat: Infinity, ease: "linear" }}
                                            >
                                                <div className="relative w-72 h-36 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden border-2 border-transparent">
                                                    {/* Dynamic LED Border Animation */}
                                                    <motion.div
                                                        className="absolute inset-0 rounded-2xl opacity-80"
                                                        animate={{
                                                            borderColor: borderColors
                                                        }}
                                                        transition={{ duration: winTier >= 70 ? 0.5 : 2, repeat: Infinity, ease: "linear" }}
                                                        style={{ borderWidth: '3px', borderStyle: 'solid' }}
                                                    />

                                                    {/* Shine Effect for Higher Tiers */}
                                                    {winTier >= 70 && (
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                                                            animate={{ x: [-300, 300] }}
                                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                        />
                                                    )}

                                                    <div className="flex flex-col items-center gap-2 z-10 w-full px-4">
                                                        <div className="p-2 bg-white/10 rounded-full">
                                                            <SparklesIcon className="w-6 h-6 animate-pulse" style={{ color: textColor }} />
                                                        </div>
                                                        <span className="text-xl font-black tracking-widest drop-shadow-md font-mono" style={{ color: textColor }}>
                                                            {winTier === 100 ? 'LEGENDARY' : 'COUPON'}
                                                        </span>
                                                        <motion.div
                                                            className="text-2xl font-black text-center w-full"
                                                            animate={{
                                                                scale: [1, 1.1, 1],
                                                                color: borderColors
                                                            }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            {lastReward}
                                                        </motion.div>
                                                        {/* Company Info Tiny Footer */}
                                                        <div className="flex flex-col items-center justify-center mt-1">
                                                            <p className="text-[8px] text-gray-400 opacity-70 leading-tight">(주)발로레 | AIRCTT BERT</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {/* Anticipation / Fever Mode Overlay */}
            {previewMode && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none overflow-hidden">
                    {/* Background Strobe */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.8, 0],
                            backgroundColor: previewTier === 100 ? ["#000", "#FFF", "#000"] : (previewTier >= 70 ? ["#000", "#D500F9", "#000"] : ["#000", "#FFD600", "#000"])
                        }}
                        transition={{ duration: 0.2, repeat: Infinity }}
                        className="absolute inset-0 z-0 bg-black"
                    />

                    {/* Warning Text */}
                    <div className="z-10 text-center space-y-4">
                        <motion.h1
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-6xl font-black text-red-600 bg-white px-6 py-2 tracking-tighter shadow-2xl skew-x-12"
                            style={{ textShadow: "0 0 20px red" }}
                        >
                            {previewTier === 100 ? "LEGENDARY" : (previewTier >= 70 ? "CRITICAL" : "CAUTION")}
                        </motion.h1>
                        <motion.div
                            animate={{ x: [-10, 10, -10] }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                            className="text-2xl font-mono text-white font-bold tracking-[0.5em] bg-red-600 px-4"
                        >
                            HIGH ENERGY DETECTED
                        </motion.div>
                    </div>

                    {/* Scan Lines or Visual Noise */}
                    <div className="absolute inset-0 z-20 pointer-events-none bg-[url('/grid.png')] opacity-10" />
                </div>
            )}

            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD600" />

                <Environment preset="city" />

                <group>
                    {gems.map(gem => (
                        <FallingGem
                            key={gem.id}
                            id={gem.id}
                            position={gem.pos}
                            color={gem.color}
                            scale={gem.scale}
                            shape={gem.shape}
                            onInteraction={(id) => handleInteraction(id, gem.pos, gem.color)}
                        />
                    ))}
                </group>

                {/* Explosions */}
                {explosions.map(exp => (
                    <Explosion key={exp.id} position={exp.position} color={exp.color} />
                ))}

                {/* Weather Effect System */}
                {/* User Request: Connect Weather API later, currently Test Mode (Snow Only) 
                    Size: 20-30% of Gem Size -> Handled in WeatherOverlay
                */}
                <WeatherOverlay type="snow" intensity={1.5} />
            </Canvas>
        </div>
    );
}


