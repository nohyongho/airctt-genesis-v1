'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LanguageToggleProps {
    lang: 'ko' | 'en';
    onToggle: () => void;
}

export default function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
    return (
        <button
            onClick={onToggle}
            className="relative flex items-center bg-black/40 backdrop-blur-md border border-white/20 rounded-full p-1 w-20 h-9 transition-colors hover:bg-black/50"
        >
            {/* Sliding Background */}
            <motion.div
                className="absolute w-8 h-7 bg-white rounded-full shadow-sm z-0"
                animate={{ x: lang === 'ko' ? 2 : 42 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />

            {/* Text Labels */}
            <div className="flex justify-between w-full px-2 text-[10px] font-bold z-10">
                <span className={`transition-colors ${lang === 'ko' ? 'text-black' : 'text-white/60'}`}>
                    KR
                </span>
                <span className={`transition-colors ${lang === 'en' ? 'text-black' : 'text-white/60'}`}>
                    EN
                </span>
            </div>
        </button>
    );
}
