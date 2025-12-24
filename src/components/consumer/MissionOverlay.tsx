'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star } from 'lucide-react';

interface MissionOverlayProps {
    lang: 'ko' | 'en';
}

export default function MissionOverlay({ lang }: MissionOverlayProps) {
    const t = {
        daily: lang === 'ko' ? '일일 미션' : 'DAILY',
        title: lang === 'ko' ? '모닝 미션' : 'MORNING MISSION',
        desc: lang === 'ko' ? '숨겨진 쿠폰 3개를 찾아보세요!' : 'Find 3 hidden coupons!',
        found: lang === 'ko' ? '1 / 3 찾음' : '1 / 3 Found',
    };

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute top-4 left-4 right-4 z-20"
        >
            <div className="relative text-[#FFD600] rounded-3xl p-4 overflow-hidden">
                {/* Decorative Shapes */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFD600]/20 rounded-bl-full blur-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#00C853]/20 rounded-tr-full blur-xl" />

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#FFD600] text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,214,0,0.5)]">
                                {t.daily}
                            </span>
                            <h3 className="font-bold text-lg text-[#00C853] tracking-wide">{t.title}</h3>
                        </div>
                        <p className="text-white/80 text-xs font-medium">{t.desc}</p>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-[#FFD600]/50 shadow-[0_0_10px_rgba(255,214,0,0.3)]">
                            <Star className="w-5 h-5 text-[#FFD600] fill-[#FFD600] drop-shadow-[0_0_5px_rgba(255,214,0,0.8)]" />
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 bg-black/20 rounded-full h-2 overflow-hidden border border-white/10">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "33%" }}
                        className="h-full bg-[#00C853] shadow-[0_0_10px_#00C853]"
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/60 font-medium">{t.found}</span>
                    <span className="text-[10px] text-[#00C853] font-bold drop-shadow-[0_0_5px_rgba(0,200,83,0.8)]">+500P</span>
                </div>
            </div>
        </motion.div>
    );
}
