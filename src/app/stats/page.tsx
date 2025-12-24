
'use client';

import { useEffect, useState } from 'react';
import { Users, UserPlus, TrendingUp, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { customerService, Customer } from '@/lib/customers';
import { merchantService, Merchant } from '@/lib/merchants';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import Link from 'next/link';

interface DashboardStats {
  totalCustomers: number;
  todayCustomers: number;
  recentCustomers: Customer[];
  recentMerchants: Merchant[];
  chartData: Array<{ date: string; count: number }>;
}

function StatsContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    todayCustomers: 0,
    recentCustomers: [],
    recentMerchants: [],
    chartData: [],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const customers = customerService.getAll();
    const merchants = merchantService.getAll();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCustomers = customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const chartData = last7Days.map(date => {
      const count = customers.filter(c => {
        const createdDate = new Date(c.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === date.getTime();
      }).length;

      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count,
      };
    });

    const recentCustomers = [...customers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentMerchants = [...merchants]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    setStats({
      totalCustomers: customers.length,
      todayCustomers: todayCustomers.length,
      recentCustomers,
      recentMerchants,
      chartData,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground mt-2">AIRCTT CRM 통계 및 현황</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 고객 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">전체 등록된 고객</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 등록</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">오늘 등록된 고객</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 가맹점 수</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentMerchants.length}</div>
              <p className="text-xs text-muted-foreground mt-1">전체 등록된 가맹점</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>최근 7일 고객 등록 추이</CardTitle>
              <CardDescription>일별 신규 고객 등록 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: '고객 수',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 등록 고객</CardTitle>
              <CardDescription>최근 5명의 신규 고객</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCustomers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    등록된 고객이 없습니다.
                  </p>
                ) : (
                  stats.recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                        <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 등록 가맹점</CardTitle>
              <CardDescription>최근 5개의 신규 가맹점</CardDescription>
            </div>
            <Link href="/merchants">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                전체 보기
              </Badge>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentMerchants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  등록된 가맹점이 없습니다.
                </p>
              ) : (
                stats.recentMerchants.map((merchant) => (
                  <div key={merchant.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <Store className="h-10 w-10 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{merchant.name}</p>
                        <Badge variant={merchant.status === 'active' ? 'default' : 'secondary'}>
                          {merchant.status === 'active' ? '운영중' : '휴면'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{merchant.businessName}</p>
                      <p className="text-xs text-muted-foreground truncate">{merchant.contact}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(merchant.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function StatsPage() {
  return (
    <ProtectedRoute>
      <StatsContent />
    </ProtectedRoute>
  );
}
