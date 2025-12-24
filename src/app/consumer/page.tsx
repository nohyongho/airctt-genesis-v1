
'use client';

import { motion } from 'framer-motion';
import { AIRCTT_CATEGORIES } from '@/lib/constants/categories';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MarketplaceMain() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header - Transparent Sticky */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 h-16 max-w-md mx-auto">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AIRCTT
            </span>
            <span className="text-xs font-bold text-slate-400 border border-slate-200 px-1 rounded">BETA</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-600">
              <MapPin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="맛집, 공연, 핫플레이스 검색..."
              className="pl-9 bg-slate-100 border-none h-10 rounded-xl focus-visible:ring-indigo-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-8">

        {/* Hero Banner (Event) */}
        <section
          className="relative h-48 rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition hover:scale-[1.02]"
          onClick={() => router.push('/consumer/game')}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
          <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
            <span className="bg-white/20 w-fit px-2 py-1 rounded text-xs font-bold mb-2 backdrop-blur-sm">Real-time Event</span>
            <h2 className="text-2xl font-bold leading-tight mb-1">지금 접속하면<br />50% 쿠폰 잭팟! 💎</h2>
            <p className="text-sm opacity-90">내 주변 하늘에서 선물이 쏟아집니다.</p>
          </div>
          {/* 3D or Image placeholder */}
          <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-50" />
        </section>

        {/* Categories Grid */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-lg text-slate-800">어디로 갈까요?</h3>
            <span className="text-xs text-slate-400">전체보기</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {AIRCTT_CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => router.push(`/consumer/market/category/${cat.id}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-active:scale-95 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-600 text-center">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Popular / Recommended (Placeholder for Step 1) */}
        <section>
          <h3 className="font-bold text-lg text-slate-800 mb-4">🔥 지금 뜨는 핫플레이스</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm" onClick={() => router.push(`/consumer/market/store/${i}`)}>
                <div className="w-24 h-24 bg-slate-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-slate-900">AIRCTT 강남 {i}호점</h4>
                    <p className="text-xs text-slate-500 mt-1">서울 강남구 테헤란로 123</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded font-medium">쿠폰 2개</span>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">거리 0.5km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
