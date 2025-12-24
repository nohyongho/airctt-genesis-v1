
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ChefHat, Minus, Plus, CreditCard, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Mock Menu Data (Will be fetched from DB)
const MOCK_MENU = [
    { id: 1, name: '시그니처 아메리카노', price: 4500, desc: '다크 초콜릿의 풍미가 느껴지는 스페셜 블렌드', img: '/coffee.jpg', category: 'COFFEE' },
    { id: 2, name: '바닐라 빈 라떼', price: 5500, desc: '천연 바닐라빈 시럽으로 만든 달콤한 라떼', img: '/latte.jpg', category: 'COFFEE' },
    { id: 3, name: '수제 티라미수', price: 7000, desc: '마스카포네 치즈가 듬뿍 들어간 이탈리아 정통 티라미수', img: '/tiramisu.jpg', category: 'DESSERT' },
    { id: 4, name: '에그 타르트', price: 3500, desc: '겉바속촉 포르투갈식 에그타르트', img: '/tart.jpg', category: 'DESSERT' },
];

export default function TableOrderPage() {
    const router = useRouter();
    const params = useParams();
    const tableId = params.tableId; // e.g., '1', '2'

    const [cart, setCart] = useState<{ id: number; qty: number; name: string; price: number }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Helpers
    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { id: item.id, qty: 1, name: item.name, price: item.price }];
        });
        toast.success(`${item.name} 담기 완료`);
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
    };

    const totalAmount = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

    const handleOrder = async () => {
        // API call placeholder
        toast.loading('주문을 주방으로 전송 중...');
        await new Promise(r => setTimeout(r, 1500));
        toast.dismiss();
        toast.success('주문이 접수되었습니다! 잠시만 기다려주세요. 🍳');
        setCart([]);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="font-bold text-lg">테이블 {tableId}번</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ChefHat className="w-4 h-4" />
                    <span>강남 1호점</span>
                </div>
            </header>

            {/* Category Tabs */}
            <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar bg-white">
                {['ALL', 'COFFEE', 'DESSERT', 'BEVERAGE'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="p-4 grid grid-cols-1 gap-4">
                {MOCK_MENU.filter(m => selectedCategory === 'ALL' || m.category === selectedCategory).map(item => (
                    <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="w-24 h-24 bg-slate-200 rounded-lg flex-shrink-0" /> {/* Placeholder Img */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900">{item.name}</h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-slate-900">{item.price.toLocaleString()}원</span>
                                <Button size="sm" className="h-8 bg-indigo-50 text-indigo-600 hover:bg-indigo-100" onClick={() => addToCart(item)}>
                                    <Plus className="w-4 h-4 mr-1" /> 담기
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Cart Bar */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.1)] rounded-t-2xl z-50 safe-area-bottom"
                    >
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setCart([])}>
                                <div className="flex items-center gap-2">
                                    <div className="bg-indigo-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                                        {cart.reduce((a, c) => a + c.qty, 0)}
                                    </div>
                                    <span className="font-bold text-slate-800">장바구니</span>
                                </div>
                                <span className="text-xl font-extrabold text-indigo-600">{totalAmount.toLocaleString()}원</span>
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                                onClick={handleOrder}
                            >
                                <CreditCard className="w-5 h-5 mr-2" />
                                주문하기
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
