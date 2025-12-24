'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MonsterPinProps {
    color: string;
    delay?: number;
    onClick?: () => void;
}

export default function MonsterPin({ color, delay = 0, onClick }: MonsterPinProps) {
    return (
        <motion.div
            className="relative cursor-pointer group"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: "spring", bounce: 0.6 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
        >
            {/* Bounce Animation Wrapper */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    delay: Math.random() * 2
                }}
            >
                {/* Pin Body (Monster Face) */}
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative z-10 border-2 border-white"
                    style={{ backgroundColor: color }}
                >
                    {/* Face */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex gap-2">
                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-blink" />
                            <div className="w-1.5 h-1.5 bg-black rounded-full animate-blink delay-75" />
                        </div>
                        <div className="w-3 h-1.5 border-b-2 border-black rounded-full" />
                    </div>
                </div>

                {/* Pin Point */}
                <div
                    className="w-4 h-4 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 z-0"
                    style={{ backgroundColor: color }}
                />
            </motion.div>

            {/* Shadow Pulse */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm animate-pulse" />
        </motion.div>
    );
}
