'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Ticket,
  Users,
  ShoppingCart,
  Eye,
  MousePointer,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatsData {
  summary: {
    totalIssued: number;
    totalUsed: number;
    totalExpired: number;
    totalViews: number;
    totalClicks: number;
    totalOrders: number;
    totalRevenue: number;
    totalDiscount: number;
    avgConversionRate: number;
    uniqueVisitors: number;
    newCustomers: number;
  };
  dailyTrend: Array<{
    date: string;
    issued: number;
    used: number;
    orders: number;
    revenue: number;
  }>;
  couponPerformance: Array<{
    coupon_id: string;
    title: string;
    discount_type: string;
    discount_value: number;
    issued: number;
    used: number;
    views: number;
    clicks: number;
    conversion_rate: number;
  }>;
}

interface StatsWidgetProps {
  merchantId: string;
  period?: 'today' | 'week' | 'month';
}

export default function StatsWidget({ merchantId, period = 'week' }: StatsWidgetProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/merchant/stats?merchant_id=${merchantId}&period=${period}`
      );
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || '통계를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchantId) {
      fetchStats();
    }
  }, [merchantId, period]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const { summary, couponPerformance } = stats;

  return (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="쿠폰 발급"
          value={summary.totalIssued}
          unit="건"
          icon={Ticket}
          color="indigo"
        />
        <StatCard
          title="쿠폰 사용"
          value={summary.totalUsed}
          unit="건"
          icon={ShoppingCart}
          color="emerald"
          subValue={`전환율 ${summary.avgConversionRate}%`}
        />
        <StatCard
          title="신규 고객"
          value={summary.newCustomers}
          unit="명"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="총 매출"
          value={summary.totalRevenue}
          unit="원"
          icon={BarChart3}
          color="amber"
          isPrice
        />
      </div>

      {/* 쿠폰 성과 순위 */}
      {couponPerformance && couponPerformance.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              쿠폰 성과 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {couponPerformance.slice(0, 5).map((coupon, index) => (
                <div
                  key={coupon.coupon_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-amber-100 text-amber-700'
                          : index === 1
                          ? 'bg-slate-200 text-slate-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{coupon.title}</p>
                      <p className="text-xs text-slate-500">
                        {coupon.discount_type === 'percent'
                          ? `${coupon.discount_value}% 할인`
                          : `${coupon.discount_value.toLocaleString()}원 할인`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-slate-900">{coupon.issued}</p>
                      <p className="text-xs text-slate-500">발급</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-emerald-600">{coupon.used}</p>
                      <p className="text-xs text-slate-500">사용</p>
                    </div>
                    <Badge
                      variant={coupon.conversion_rate >= 30 ? 'default' : 'secondary'}
                      className={
                        coupon.conversion_rate >= 30
                          ? 'bg-emerald-100 text-emerald-700'
                          : ''
                      }
                    >
                      {coupon.conversion_rate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 노출/클릭 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">총 노출수</p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">총 클릭수</p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.totalClicks.toLocaleString()}
                </p>
                {summary.totalViews > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    CTR{' '}
                    {Math.round((summary.totalClicks / summary.totalViews) * 10000) / 100}%
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  icon: any;
  color: 'indigo' | 'emerald' | 'purple' | 'amber' | 'red';
  subValue?: string;
  isPrice?: boolean;
}

function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  subValue,
  isPrice,
}: StatCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {isPrice ? value.toLocaleString() : value.toLocaleString()}
            <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
          </p>
          {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
