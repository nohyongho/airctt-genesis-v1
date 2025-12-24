'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Filter, Heart, ShoppingBag,
    Gift, Crown, ArrowRight, Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MarketPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');

    // Mock Data for "Marketplace"
    // Blending Daangn (community) + Premium Mall (Store) + AR
    const items = [
        {
            id: 1,
            title: "스타벅스 아메리카노 1+1",
            type: "coupon", // Coupon Trade
            price: 4500,
            originalPrice: 9000,
            seller: "토끼공주",
            location: "강남구 서초동",
            image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500",
            badge: "개인거래",
            color: "blue"
        },
        {
            id: 2,
            title: "[나눔] 아이들 장난감 세트",
            type: "sharing", // Giving to needed
            price: 0,
            seller: "행복한엄마",
            location: "반포동",
            image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500",
            badge: "희망나눔",
            color: "green"
        },
        {
            id: 3,
            title: "ANT 백화점 30% 할인쿠폰",
            type: "store", // Premium Store
            price: 5000,
            originalPrice: 30000,
            seller: "(주)발로레 공식",
            location: "AIRCTT 본점",
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500",
            badge: "공식입점",
            color: "purple"
        },
        {
            id: 4,
            title: "갤럭시 워치6 (미개봉)",
            type: "goods", // Used Goods
            price: 250000,
            seller: "얼리어답터",
            location: "역삼동",
            image: "https://images.unsplash.com/photo-1579586337278-3db325797d3a?w=500",
            badge: "중고거래",
            color: "orange"
        }
    ];

    const categories = [
        { id: 'all', label: '전체', icon: <Filter size={14} /> },
        { id: 'coupon', label: '쿠폰거래', icon: <Gift size={14} /> },
        { id: 'store', label: '입점매장', icon: <Crown size={14} /> },
        { id: 'sharing', label: '구름나라', icon: <Heart size={14} /> }, // Changed from 희망나눔
    ];

    return (
        <div className="min-h-screen bg-slate-900 pb-24 text-white font-sans overflow-x-hidden">
            {/* Header: Location & Search (Daangn Style but Premium) */}
            <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-lg transition-colors">
                        <MapPin className="text-[#00C853]" size={18} />
                        <span className="font-bold text-lg">서초동</span>
                        <span className="text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded ml-1">내 동네</span>
                    </div>
                    <div className="flex gap-4">
                        <ShoppingBag size={24} className="text-white/80" />
                        <Search size={24} className="text-white/80" />
                    </div>
                </div>

                {/* Categories Scroll */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeTab === cat.id
                                    ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                                }`}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Banner Area (Premium Store Vibe) */}
            <div className="p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-40 rounded-2xl bg-gradient-to-r from-[#2962FF] to-[#AA00FF] relative overflow-hidden shadow-lg"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555529733-0e670560f7e1?w=800')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 flex flex-col justify-center px-6">
                        <div className="bg-[#00C853] w-fit px-2 py-0.5 rounded text-[10px] font-bold text-black mb-2 animate-pulse">
                            (주)발로레 공식인증
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter drop-shadow-lg">
                            AIRCTT<br /><span className="text-[#FFD600]">PREMIUM OPEN</span>
                        </h2>
                        <button className="mt-3 bg-white text-black text-xs font-bold px-4 py-2 rounded-full w-fit hover:scale-105 transition-transform flex items-center gap-1">
                            지금 구경하기 <ArrowRight size={12} />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Product Feed */}
            <div className="px-4 grid grid-cols-1 gap-4">
                {items.filter(item => activeTab === 'all' || item.type === activeTab).map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-colors cursor-pointer group"
                    >
                        <div className="flex h-32">
                            {/* Image */}
                            <div className="w-32 h-32 relative shrink-0">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-md
                                    ${item.type === 'sharing' ? 'bg-[#00C853]' :
                                        item.type === 'store' ? 'bg-[#AA00FF]' : 'bg-blue-500'}`}
                                >
                                    {item.type === 'sharing' ? '행복선물' : item.badge}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-3 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight group-hover:text-[#00C853] transition-colors">{item.title}</h3>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                        <span>{item.location}</span>
                                        <span>•</span>
                                        <span>{item.seller}</span>
                                        {item.type === 'store' && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mt-2">
                                    <div className="flex flex-col">
                                        {item.price === 0 ? (
                                            <span className="text-[#00C853] font-black text-lg">선물 🎁</span>
                                        ) : (
                                            <>
                                                {item.originalPrice && (
                                                    <span className="text-xs text-gray-600 line-through decoration-gray-500">
                                                        {item.originalPrice.toLocaleString()}원
                                                    </span>
                                                )}
                                                <span className="text-white font-black text-lg">
                                                    {item.price.toLocaleString()}원
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#00C853] transition-colors">
                                        <Heart size={16} className={`group-hover:text-white ${item.type === 'sharing' ? 'text-red-500' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Back Button for Demo (Since Nav might not link yet) */}
            <button
                onClick={() => router.back()}
                className="fixed bottom-24 right-4 bg-black/50 backdrop-blur border border-white/20 p-2 rounded-full text-xs text-gray-400"
            >
                뒤로가기
            </button>
        </div>
    );
}
