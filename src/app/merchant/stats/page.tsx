
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  DollarSign,
  ShoppingBag,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { initMerchantDemo } from '@/lib/merchant-service';

const salesData = [
  { date: '1월', sales: 4200000, orders: 120, coupons: 45 },
  { date: '2월', sales: 3800000, orders: 98, coupons: 38 },
  { date: '3월', sales: 5100000, orders: 145, coupons: 62 },
  { date: '4월', sales: 4700000, orders: 132, coupons: 55 },
  { date: '5월', sales: 5800000, orders: 168, coupons: 78 },
  { date: '6월', sales: 6200000, orders: 185, coupons: 92 },
];

const weeklyData = [
  { day: '월', value: 850000 },
  { day: '화', value: 920000 },
  { day: '수', value: 780000 },
  { day: '목', value: 1100000 },
  { day: '금', value: 1350000 },
  { day: '토', value: 1580000 },
  { day: '일', value: 1420000 },
];

const categoryData = [
  { name: '음료', value: 45, color: '#8b5cf6' },
  { name: '디저트', value: 25, color: '#ec4899' },
  { name: '식사', value: 20, color: '#06b6d4' },
  { name: '기타', value: 10, color: '#f59e0b' },
];

const hourlyData = [
  { hour: '9시', customers: 12 },
  { hour: '10시', customers: 25 },
  { hour: '11시', customers: 45 },
  { hour: '12시', customers: 78 },
  { hour: '13시', customers: 65 },
  { hour: '14시', customers: 42 },
  { hour: '15시', customers: 38 },
  { hour: '16시', customers: 52 },
  { hour: '17시', customers: 68 },
  { hour: '18시', customers: 85 },
  { hour: '19시', customers: 72 },
  { hour: '20시', customers: 48 },
];

export default function MerchantStatsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    initMerchantDemo();
  }, []);

  const stats = [
    {
      label: '총 매출',
      value: '29,800,000',
      unit: '원',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-emerald-500 to-green-500',
    },
    {
      label: '총 주문',
      value: '848',
      unit: '건',
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: '쿠폰 사용',
      value: '370',
      unit: '건',
      change: '+15.3%',
      isPositive: true,
      icon: Ticket,
      color: 'from-violet-500 to-purple-500',
    },
    {
      label: '신규 고객',
      value: '156',
      unit: '명',
      change: '-2.1%',
      isPositive: false,
      icon: Users,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const goals = [
    { label: '월 매출 목표', current: 6200000, target: 8000000, unit: '원' },
    { label: '신규 고객 목표', current: 156, target: 200, unit: '명' },
    { label: '쿠폰 사용률', current: 78, target: 100, unit: '%' },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass-dark">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white font-bold text-lg">통계 분석</h1>
              <p className="text-white/70 text-xs">실시간 데이터 분석</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
            <Activity className="w-3 h-3 mr-1" />
            실시간
          </Badge>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="grid grid-cols-4 glass-card">
              <TabsTrigger value="day">일간</TabsTrigger>
              <TabsTrigger value="week">주간</TabsTrigger>
              <TabsTrigger value="month">월간</TabsTrigger>
              <TabsTrigger value="year">연간</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="glass-card hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          stat.isPositive
                            ? 'border-emerald-500/50 text-emerald-500'
                            : 'border-red-500/50 text-red-500'
                        }`}
                      >
                        {stat.isPositive ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="text-xl font-bold">
                      {stat.value}
                      <span className="text-xs text-muted-foreground ml-1">
                        {stat.unit}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                매출 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: '매출',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <PieChart className="w-4 h-4 text-primary" />
                카테고리별
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: '비율',
                  },
                }}
                className="h-[150px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                주간 매출
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: '매출',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-[150px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis
                      dataKey="day"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                시간대별 방문객
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  customers: {
                    label: '방문객',
                    color: 'hsl(var(--chart-2))',
                  },
                }}
                className="h-[150px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="hour"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="customers"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                목표 달성률
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal, index) => {
                const percentage = Math.round((goal.current / goal.target) * 100);
                return (
                  <div key={goal.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{goal.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                          {goal.unit}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            percentage >= 80
                              ? 'border-emerald-500/50 text-emerald-500'
                              : percentage >= 50
                              ? 'border-amber-500/50 text-amber-500'
                              : 'border-red-500/50 text-red-500'
                          }`}
                        >
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3 pb-4"
        >
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground">평균 평점</p>
              </div>
            </div>
          </Card>
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-xs text-muted-foreground">재방문율</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
