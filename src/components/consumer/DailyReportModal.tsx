'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Share2, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyReportModalProps {
    onClose: () => void;
    lang: 'ko' | 'en';
}

export default function DailyReportModal({ onClose, lang }: DailyReportModalProps) {
    const t = {
        title: lang === 'ko' ? '데일리 리포트' : 'Daily Report',
        subtitle: lang === 'ko' ? '어제의 요약' : "Yesterday's Summary",
        coupons: lang === 'ko' ? '01 쿠폰 획득' : '01 Coupons Found',
        target: lang === 'ko' ? '목표: 10' : 'Target: 10',
        likes: lang === 'ko' ? '02 받은 좋아요' : '02 Likes Received',
        comment: lang === 'ko' ? '어제 도와줘서 고마워요! 당신은 최고! 🌟' : "Thanks for the help yesterday! You're a star! 🌟",
        button: lang === 'ko' ? '확인' : 'Awesome!',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            >
                {/* Header */}
                <div className="bg-[#1a1a1a] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1">{t.title}</h2>
                        <p className="text-white/60 text-sm">{t.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Stat 1: Sales / Coupons */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-[#00C853]">{t.coupons}</span>
                            <span className="text-xs text-gray-500">{t.target}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "60%" }}
                                transition={{ delay: 0.2, duration: 1 }}
                                className="h-full bg-[#00C853] rounded-full"
                            />
                        </div>
                        <div className="text-right text-xs font-bold">6 / 10</div>
                    </div>

                    {/* Stat 2: Likes */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-[#00C853]">{t.likes}</span>
                            <div className="flex gap-1">
                                <ThumbsUp className="w-4 h-4 text-[#FFD600] fill-[#FFD600]" />
                                <span className="text-xs font-bold">15</span>
                            </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "80%" }}
                                transition={{ delay: 0.4, duration: 1 }}
                                className="h-full bg-[#FFD600] rounded-full"
                            />
                        </div>
                    </div>

                    {/* Comments / Feedback */}
                    <div className="bg-[#f8f9fa] p-4 rounded-2xl space-y-3">
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                JD
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800 bg-white p-2 rounded-r-xl rounded-bl-xl shadow-sm">
                                    {t.comment}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        className="w-full bg-[#00C853] hover:bg-[#00b34a] text-white rounded-xl h-12 font-bold text-lg shadow-lg shadow-green-500/30"
                        onClick={onClose}
                    >
                        {t.button}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
