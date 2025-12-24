'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface RabbitRewardProps {
    onComplete: () => void;
    rewardName: string;
    lang: 'ko' | 'en';
}

export default function RabbitReward({ onComplete, rewardName, lang }: RabbitRewardProps) {
    useEffect(() => {
        // Auto-close after animation sequence
        const timer = setTimeout(onComplete, 4000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const t = {
        congrats: lang === 'ko' ? '당첨 축하드려요!' : 'Congratulations!',
    };

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
            {/* Background Burst */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                className="absolute w-full h-full bg-gradient-to-r from-yellow-300/50 via-orange-300/50 to-pink-300/50 blur-xl radial-gradient"
            />

            {/* Rabbit Container */}
            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Speech Bubble */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-4"
                >
                    <p className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-md">
                        <span className="text-2xl">🎉</span>
                        {t.congrats}
                    </p>
                    <div className="mt-2">
                        <motion.span
                            className="text-3xl font-black tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            animate={{
                                color: ["#00C853", "#FFD600", "#2962FF", "#00C853"],
                                textShadow: [
                                    "0 0 10px rgba(0,200,83,0.8)",
                                    "0 0 10px rgba(255,214,0,0.8)",
                                    "0 0 10px rgba(41,98,255,0.8)",
                                    "0 0 10px rgba(0,200,83,0.8)"
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            {rewardName}
                        </motion.span>
                    </div>
                </motion.div>

                {/* The 3D Rabbit Image */}
                <div className="relative w-48 h-48">
                    <motion.img
                        src="/cute_3d_rabbit_standing.png" // Assuming image is placed in public
                        alt="Dancing Rabbit"
                        className="w-full h-full object-contain drop-shadow-2xl"
                        animate={{
                            rotate: [0, -5, 5, 0],
                            y: [0, -10, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "easeInOut",
                            repeatType: "reverse"
                        }}
                        style={{ transformOrigin: "bottom center" }}
                    />

                    {/* Arms holding Coupon (Overlay on image if needed, or just part of the scene) */}
                    <motion.div
                        initial={{ y: 10, rotate: -10 }}
                        animate={{ y: -10, rotate: 10 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                        className="absolute top-24 left-1/2 -translate-x-1/2 z-20"
                    >
                        <motion.div
                            className="px-4 py-2 rounded-lg shadow-lg border-2 border-white flex items-center gap-2 transform rotate-12 origin-bottom-left"
                            animate={{
                                backgroundColor: ["#FFD600", "#2962FF", "#FF3D00", "#FFD600"],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
                            <span className="text-xs font-black text-white tracking-widest">COUPON</span>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Confetti Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 0, x: 0, opacity: 1 }}
                    animate={{
                        y: -300 - Math.random() * 200,
                        x: (Math.random() - 0.5) * 400,
                        opacity: 0,
                        rotate: Math.random() * 720,
                        scale: Math.random() * 1.5
                    }}
                    transition={{ duration: 2, delay: 0.1 }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                        backgroundColor: ['#FFD600', '#00C853', '#2962FF', '#FF3D00', '#AA00FF'][Math.floor(Math.random() * 5)]
                    }}
                />
            ))}
        </div>
    );
}
