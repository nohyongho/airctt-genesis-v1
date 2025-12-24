
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, ChevronLeft, Heart, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PerformanceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Mock Data (Placeholder for DB)
    const performance = {
        id: params.id,
        title: '뮤지컬 <오페라의 유령>',
        poster: '/poster_phantom.jpg', // Placeholder
        genre: 'MUSICAL',
        runningTime: 150,
        rating: 9.8,
        location: '샤롯데씨어터',
        period: '2025.12.01 ~ 2026.03.31',
        description: '거대한 샹들리에의 추락, 전율의 무대! 브로드웨이 최장기 공연의 감동을 다시 만난다.'
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-32">
            {/* 1. Immersive Header (Poster Background) */}
            <div className="relative h-[50vh] overflow-hidden">
                {/* Blurry Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 scale-110"
                    style={{ backgroundImage: `url(${performance.poster})`, backgroundColor: '#331155' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                {/* Nav */}
                <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => router.back()}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><Heart className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><Share2 className="w-5 h-5" /></Button>
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex gap-6 items-end">
                    {/* Poster Card */}
                    <div className="w-32 h-44 bg-slate-800 rounded-lg shadow-2xl overflow-hidden border border-white/10 shrink-0 hidden sm:block">
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                            Poster Img
                        </div>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 space-y-2">
                        <Badge className="bg-pink-600 hover:bg-pink-700 border-none">TOP 1</Badge>
                        <Badge variant="outline" className="text-white border-white/30 ml-2">{performance.genre}</Badge>

                        <h1 className="text-3xl font-bold leading-tight">{performance.title}</h1>

                        <div className="flex items-center gap-4 text-sm text-slate-300 pt-2">
                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {performance.rating}</span>
                            <span>{performance.runningTime}분</span>
                            <span>만 7세 이상</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Info Grid */}
            <div className="p-6 max-w-4xl mx-auto space-y-8">

                {/* Key Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400">공연 기간</p>
                            <p className="font-bold">{performance.period}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-slate-400">공연 장소</p>
                            <p className="font-bold">{performance.location}</p>
                        </div>
                    </div>
                </div>

                {/* Synopsis */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold border-l-4 border-pink-500 pl-3">줄거리</h3>
                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                        {performance.description}
                        <br /><br />
                        19세기 파리 오페라 하우스. 천상의 목소리를 가졌지만 흉측한 얼굴을 가면으로 가린 채 오페라 하우스 지하에 숨어 사는 유령...
                    </p>
                </div>

                {/* Cast */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold border-l-4 border-pink-500 pl-3">출연진</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                                <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-600" />
                                <span className="text-sm">배우 {i}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-white/10 safe-area-bottom z-50">
                <Button
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-lg font-bold shadow-lg shadow-purple-900/50"
                    onClick={() => router.push(`/consumer/culture/select-seat/${performance.id}`)}
                >
                    예매하기 (Booking)
                </Button>
            </div>

        </div>
    );
}
