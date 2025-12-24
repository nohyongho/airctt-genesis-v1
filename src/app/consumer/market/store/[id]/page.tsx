
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Heart, MapPin, Phone, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoreDetailPage() {
    const router = useRouter();
    const params = useParams();
    const storeId = params.id;

    // Mock Data (will be replaced by DB fetch in later steps)
    const storeInfo = {
        name: `AIRCTT 강남 ${storeId}호점`,
        category: '카페/디저트',
        rating: 4.8,
        reviewCount: 128,
        address: '서울 강남구 테헤란로 123',
        phone: '02-1234-5678',
        openTime: '10:00 - 22:00',
        description: '도심 속 힐링 공간, 프리미엄 원두와 수제 디저트를 즐겨보세요. AIRCTT 회원 전용 혜택 제공.',
        images: ['', '', ''] // Placeholders
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* 1. Header Image Area */}
            <div className="relative h-64 bg-slate-200">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                {/* Top Nav */}
                <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center text-white">
                    <Button variant="ghost" size="icon" className="hover:bg-white/20" onClick={() => router.back()}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="hover:bg-white/20">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-white/20">
                            <Heart className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Title Info */}
                <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded backdrop-blur-md border border-white/30 mb-2 inline-block">
                        {storeInfo.category}
                    </span>
                    <h1 className="text-2xl font-bold mb-1">{storeInfo.name}</h1>
                    <div className="flex items-center gap-1 text-sm opacity-90">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">{storeInfo.rating}</span>
                        <span className="text-gray-300">({storeInfo.reviewCount}개 리뷰)</span>
                    </div>
                </div>
            </div>

            {/* 2. Content Tabs (Placeholder for now) */}
            <div className="flex border-b sticky top-0 bg-white z-30">
                {['홈', '메뉴', '리뷰', '사진'].map((tab, i) => (
                    <button key={tab} className={`flex-1 py-3 text-sm font-medium ${i === 0 ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* 3. Info Section */}
            <div className="p-4 space-y-6">
                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">쿠폰 받기 🎁</Button>
                    <Button variant="outline" className="flex-1 border-indigo-200 text-indigo-700">테이블 주문 🍽️</Button>
                </div>

                {/* Details */}
                <div className="space-y-4 text-sm text-slate-600">
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                        <div className="flex gap-3 items-center">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <span>{storeInfo.address}</span>
                            <span className="text-xs bg-slate-200 px-1.5 py-0.5 rounded ml-auto cursor-pointer">복사</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <span>{storeInfo.openTime}</span>
                            <span className="text-xs text-green-600 font-bold ml-auto">영업중</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <span>{storeInfo.phone}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 mb-2 text-base">매장 소개</h3>
                        <p className="leading-relaxed">{storeInfo.description}</p>
                    </div>
                </div>
            </div>

            {/* 4. Bottom Floating Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white safe-area-bottom">
                <Button size="lg" className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 font-bold text-lg h-14 shadow-lg shadow-indigo-200">
                    예약 / 주문하기
                </Button>
            </div>

        </div>
    );
}
