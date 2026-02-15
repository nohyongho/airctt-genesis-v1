'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Store,
  ShoppingCart,
  TrendingUp,
  Star,
  MapPin,
  Filter,
  Search,
  ChevronLeft,
  Heart,
  Tag,
  Zap,
  Clock,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface MarketItem {
  id: string;
  name: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  category: 'food' | 'cafe' | 'shopping' | 'culture';
  rating: number;
  soldCount: number;
  imageUrl?: string;
  distance?: string;
  hot?: boolean;
}

export default function AircttMarketPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: '전체', icon: Store },
    { id: 'food', name: '맛집', icon: Store },
    { id: 'cafe', name: '카페', icon: Store },
    { id: 'shopping', name: '쇼핑', icon: ShoppingCart },
    { id: 'culture', name: '문화', icon: Star },
  ];

  const marketItems: MarketItem[] = [
    {
      id: '1',
      name: '시그니처 아메리카노 50% 할인',
      storeName: '구름카페 강남점',
      price: 2000,
      originalPrice: 4000,
      discount: '50%',
      category: 'cafe',
      rating: 4.8,
      soldCount: 234,
      distance: '0.3km',
      hot: true,
    },
    {
      id: '2',
      name: '런치세트 30% 할인권',
      storeName: 'AIRCTT 레스토랑',
      price: 7000,
      originalPrice: 10000,
      discount: '30%',
      category: 'food',
      rating: 4.9,
      soldCount: 567,
      distance: '0.5km',
      hot: true,
    },
    {
      id: '3',
      name: '영화 예매권 2장',
      storeName: 'CGV 강남',
      price: 15000,
      originalPrice: 28000,
      discount: '46%',
      category: 'culture',
      rating: 4.7,
      soldCount: 123,
      distance: '1.2km',
    },
    {
      id: '4',
      name: '디저트 플레이팅 무료',
      storeName: '스위트하우스',
      price: 0,
      category: 'cafe',
      rating: 4.6,
      soldCount: 89,
      distance: '0.8km',
    },
    {
      id: '5',
      name: '의류 10,000원 할인',
      storeName: '패션플라자',
      price: 5000,
      originalPrice: 10000,
      discount: '50%',
      category: 'shopping',
      rating: 4.5,
      soldCount: 45,
      distance: '2.1km',
    },
  ];

  const filteredItems = selectedCategory === 'all'
    ? marketItems
    : marketItems.filter(item => item.category === selectedCategory);

  const handleBuy = (item: MarketItem) => {
    toast.success(`${item.name} 구매 완료!`);
  };

  const handleLike = (itemId: string) => {
    toast.success('찜 목록에 추가되었습니다!');
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
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                구름장터
              </h1>
              <p className="text-xs text-slate-500">쿠폰 마켓플레이스</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3 max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="쿠폰, 매장 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-100 dark:bg-slate-800 border-none h-10 rounded-xl"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Badge className="bg-white/20 text-white">오늘의 특가</Badge>
                  <h2 className="text-2xl font-bold">구름장터 최저가!</h2>
                  <p className="text-sm opacity-90">지금 바로 쿠폰 겟!</p>
                </div>
                <div className="text-6xl">🏪</div>
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
          <Card className="border-orange-200 dark:border-orange-900">
            <CardContent className="p-4 text-center space-y-1">
              <TrendingUp className="w-5 h-5 mx-auto text-orange-500" />
              <div className="text-xl font-bold">1,234</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">진행중</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-4 text-center space-y-1">
              <Zap className="w-5 h-5 mx-auto text-red-500" />
              <div className="text-xl font-bold">567</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">오늘 판매</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 dark:border-purple-900">
            <CardContent className="p-4 text-center space-y-1">
              <Users className="w-5 h-5 mx-auto text-purple-500" />
              <div className="text-xl font-bold">8.9k</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">참여자</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap"
            >
              <cat.icon className="w-4 h-4 mr-1" />
              {cat.name}
            </Button>
          ))}
        </motion.div>

        {/* Market Items Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">
              전체 {filteredItems.length}개
            </h3>
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              필터
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-all cursor-pointer group">
                  <CardContent className="p-4 space-y-3">
                    {/* Header with Hot Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.hot && (
                            <Badge variant="destructive" className="text-xs">
                              🔥 HOT
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === item.category)?.name}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {item.name}
                        </h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item.id);
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Store Info */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Store className="w-4 h-4" />
                      <span>{item.storeName}</span>
                    </div>

                    {/* Rating & Distance */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                      {item.distance && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{item.distance}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{item.soldCount}명 구매</span>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="flex items-end justify-between pt-2 border-t dark:border-slate-700">
                      <div>
                        {item.originalPrice && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs line-through text-slate-400">
                              {item.originalPrice.toLocaleString()}P
                            </span>
                            {item.discount && (
                              <Badge variant="destructive" className="text-xs">
                                {item.discount}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-orange-600">
                          {item.price === 0 ? '무료' : `${item.price.toLocaleString()}P`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleBuy(item)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <Tag className="w-4 h-4 mr-1" />
                        구매하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Load More */}
        <div className="text-center pt-4">
          <Button variant="outline" className="w-full md:w-auto">
            더보기
          </Button>
        </div>
      </main>
    </div>
  );
}
