'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Wallet,
  Store,
  Home,
  Zap,
  Gift,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AircttHub() {
  const router = useRouter();

  const mainFeatures = [
    {
      id: 'game',
      title: '3D 쿠폰 게임',
      description: '재미있는 게임으로 쿠폰 획득!',
      icon: Gamepad2,
      color: 'from-purple-500 via-pink-500 to-rose-500',
      href: '/airctt/game',
      badge: 'HOT',
      emoji: '🎮',
    },
    {
      id: 'wallet',
      title: '쿠폰 지갑',
      description: '내 쿠폰과 포인트 관리',
      icon: Wallet,
      color: 'from-cyan-500 via-blue-500 to-indigo-500',
      href: '/airctt/wallet',
      badge: 'NEW',
      emoji: '💳',
    },
    {
      id: 'market',
      title: '구름장터',
      description: '쿠폰 거래 & 마켓플레이스',
      icon: Store,
      color: 'from-amber-500 via-orange-500 to-red-500',
      href: '/airctt/market',
      badge: null,
      emoji: '🏪',
    },
  ];

  const quickActions = [
    { label: '내 쿠폰 보기', icon: Gift, href: '/airctt/wallet' },
    { label: '포인트 충전', icon: Zap, href: '/airctt/wallet' },
    { label: '실시간 랭킹', icon: TrendingUp, href: '/airctt/game' },
    { label: '이벤트', icon: Sparkles, href: '/airctt/market' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="font-extrabold text-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AIRCTT
            </span>
            <Badge variant="outline" className="text-xs">Hub</Badge>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="text-slate-600 dark:text-slate-400"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 pb-20">

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            AIRCTT Hub
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            게임, 지갑, 마켓을 한 곳에서!<br />
            쿠폰톡톡과 함께하는 스마트한 쿠폰 라이프
          </p>
        </motion.section>

        {/* Main Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mainFeatures.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className="relative overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500/50"
                onClick={() => router.push(feature.href)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

                <CardContent className="relative p-6 space-y-4">
                  {feature.badge && (
                    <Badge variant="secondary" className="absolute top-4 right-4 bg-red-500 text-white">
                      {feature.badge}
                    </Badge>
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <span className="text-4xl">{feature.emoji}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium group-hover:gap-3 transition-all">
                    <span className="text-sm">바로가기</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            빠른 메뉴
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white border-0">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">1,234</div>
                  <div className="text-sm opacity-90">총 쿠폰</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">567</div>
                  <div className="text-sm opacity-90">참여 매장</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">8,901</div>
                  <div className="text-sm opacity-90">게임 플레이</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Back to Consumer */}
        <div className="text-center pt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/consumer')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            소비자 메인으로
          </Button>
        </div>
      </main>
    </div>
  );
}
