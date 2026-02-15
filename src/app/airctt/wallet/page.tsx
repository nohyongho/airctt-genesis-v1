'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Coins,
  Ticket,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Gift,
  TrendingUp,
  Clock,
  ChevronLeft,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface WalletCoupon {
  id: string;
  name: string;
  storeName: string;
  discount: string;
  validUntil: string;
  status: 'available' | 'used' | 'expired';
  imageUrl?: string;
}

interface PointTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  date: string;
}

export default function AircttWalletPage() {
  const router = useRouter();
  const [pointBalance, setPointBalance] = useState(15420);
  const [coupons, setCoupons] = useState<WalletCoupon[]>([
    {
      id: '1',
      name: '10% 할인 쿠폰',
      storeName: 'AIRCTT 강남점',
      discount: '10%',
      validUntil: '2026-03-31',
      status: 'available',
    },
    {
      id: '2',
      name: '5,000원 할인',
      storeName: '구름카페',
      discount: '5,000원',
      validUntil: '2026-02-28',
      status: 'available',
    },
    {
      id: '3',
      name: '무료 음료',
      storeName: '스타벅스',
      discount: '1+1',
      validUntil: '2026-02-20',
      status: 'used',
    },
  ]);

  const [transactions, setTransactions] = useState<PointTransaction[]>([
    { id: '1', type: 'earn', amount: 1000, description: '게임 클리어 보너스', date: '2026-02-16' },
    { id: '2', type: 'earn', amount: 500, description: '출석 체크', date: '2026-02-15' },
    { id: '3', type: 'spend', amount: 3000, description: '쿠폰 구매', date: '2026-02-14' },
    { id: '4', type: 'earn', amount: 2000, description: '친구 추천', date: '2026-02-13' },
  ]);

  const availableCoupons = coupons.filter(c => c.status === 'available');
  const usedCoupons = coupons.filter(c => c.status === 'used');

  const handleTopUp = () => {
    toast.success('포인트 충전 준비 중입니다!');
  };

  const handleUseCoupon = (couponId: string) => {
    toast.success('쿠폰 사용 완료!');
    setCoupons(prev => prev.map(c =>
      c.id === couponId ? { ...c, status: 'used' as const } : c
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-16 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/airctt')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              내 지갑
            </h1>
          </div>
          <Button variant="ghost" size="icon">
            <Gift className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Point Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white border-0 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  <span className="text-sm opacity-90">내 포인트</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  AIRCTT
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold">
                  {pointBalance.toLocaleString()}
                  <span className="text-xl ml-2">P</span>
                </div>
                <p className="text-sm opacity-90">
                  ≈ {(pointBalance / 100).toLocaleString()}원 상당
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleTopUp}
                  className="flex-1 bg-white text-purple-600 hover:bg-white/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  충전
                </Button>
                <Button
                  onClick={() => router.push('/airctt/game')}
                  variant="outline"
                  className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  게임하고 벌기
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card>
            <CardContent className="p-4 text-center space-y-1">
              <Ticket className="w-5 h-5 mx-auto text-purple-500" />
              <div className="text-2xl font-bold">{availableCoupons.length}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">사용 가능</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center space-y-1">
              <TrendingUp className="w-5 h-5 mx-auto text-green-500" />
              <div className="text-2xl font-bold">3,500</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">이번 달 적립</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center space-y-1">
              <Clock className="w-5 h-5 mx-auto text-orange-500" />
              <div className="text-2xl font-bold">7일</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">연속 출석</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs: Coupons & History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="coupons" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="coupons">
                쿠폰 ({coupons.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                내역
              </TabsTrigger>
            </TabsList>

            {/* Coupons Tab */}
            <TabsContent value="coupons" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  전체 ({coupons.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  사용 가능 ({availableCoupons.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  사용 완료 ({usedCoupons.length})
                </Button>
              </div>

              <div className="space-y-3">
                {coupons.map((coupon, idx) => (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer hover:shadow-lg transition-all ${
                        coupon.status === 'used' ? 'opacity-50' : ''
                      }`}
                      onClick={() => coupon.status === 'available' && handleUseCoupon(coupon.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900 dark:text-slate-100">
                                {coupon.name}
                              </h4>
                              <Badge
                                variant={coupon.status === 'available' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {coupon.status === 'available' ? '사용가능' : '사용완료'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {coupon.storeName}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {coupon.validUntil}까지
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {coupon.discount}
                            </div>
                            {coupon.status === 'available' && (
                              <Button size="sm" variant="ghost" className="mt-1">
                                사용하기
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-3 mt-4">
              {transactions.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === 'earn'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {tx.type === 'earn' ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {tx.description}
                            </div>
                            <div className="text-xs text-slate-500">{tx.date}</div>
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            tx.type === 'earn' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {tx.type === 'earn' ? '+' : '-'}
                          {tx.amount.toLocaleString()}P
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
