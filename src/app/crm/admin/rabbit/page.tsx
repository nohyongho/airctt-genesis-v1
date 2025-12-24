'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rabbit,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Ticket,
  ShoppingCart,
  Users,
  Store,
  RefreshCw,
  Bell,
  Shield,
  BarChart3,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TransactionEvent {
  id: string;
  event_type: string;
  merchant_id: string;
  store_id: string;
  user_id: string;
  coupon_id: string;
  amount: number;
  created_at: string;
  metadata: any;
}

interface MerchantHealth {
  merchant_id: string;
  merchant_name: string;
  overall_score: number;
  risk_level: string;
  activity_score: number;
  coupon_score: number;
}

interface AnomalyAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalMerchants: number;
  pendingApprovals: number;
  todayTransactions: number;
  activeAlerts: number;
  healthDistribution: {
    normal: number;
    warning: number;
    critical: number;
  };
}

export default function GoldenRabbitDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    pendingApprovals: 0,
    todayTransactions: 0,
    activeAlerts: 0,
    healthDistribution: { normal: 0, warning: 0, critical: 0 },
  });
  const [recentEvents, setRecentEvents] = useState<TransactionEvent[]>([]);
  const [merchantHealth, setMerchantHealth] = useState<MerchantHealth[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 실제 API 호출 대신 데모 데이터
      // 추후 /api/admin/rabbit/stats 등으로 교체

      // 데모 통계
      setStats({
        totalMerchants: 156,
        pendingApprovals: 7,
        todayTransactions: 1234,
        activeAlerts: 3,
        healthDistribution: {
          normal: 142,
          warning: 11,
          critical: 3,
        },
      });

      // 데모 이벤트 (실시간 거래 스트림)
      const demoEvents: TransactionEvent[] = [
        {
          id: '1',
          event_type: 'coupon_issued',
          merchant_id: 'm1',
          store_id: 's1',
          user_id: 'u1',
          coupon_id: 'c1',
          amount: 0,
          created_at: new Date(Date.now() - 30000).toISOString(),
          metadata: { store_name: '에어씨티티 강남점', coupon_title: '10% 할인 쿠폰' },
        },
        {
          id: '2',
          event_type: 'coupon_used',
          merchant_id: 'm2',
          store_id: 's2',
          user_id: 'u2',
          coupon_id: 'c2',
          amount: 15000,
          created_at: new Date(Date.now() - 60000).toISOString(),
          metadata: { store_name: '맛있는 식당', coupon_title: '3,000원 할인' },
        },
        {
          id: '3',
          event_type: 'coupon_issued',
          merchant_id: 'm3',
          store_id: 's3',
          user_id: 'u3',
          coupon_id: 'c3',
          amount: 0,
          created_at: new Date(Date.now() - 120000).toISOString(),
          metadata: { store_name: '카페 드 파리', coupon_title: '아메리카노 무료' },
        },
      ];
      setRecentEvents(demoEvents);

      // 데모 가맹점 건강도
      const demoHealth: MerchantHealth[] = [
        {
          merchant_id: 'm1',
          merchant_name: '에어씨티티 강남점',
          overall_score: 92,
          risk_level: 'normal',
          activity_score: 95,
          coupon_score: 88,
        },
        {
          merchant_id: 'm2',
          merchant_name: '맛있는 식당',
          overall_score: 78,
          risk_level: 'normal',
          activity_score: 80,
          coupon_score: 75,
        },
        {
          merchant_id: 'm3',
          merchant_name: '휴면 매장',
          overall_score: 25,
          risk_level: 'critical',
          activity_score: 10,
          coupon_score: 40,
        },
      ];
      setMerchantHealth(demoHealth);

      // 데모 알림
      const demoAlerts: AnomalyAlert[] = [
        {
          id: 'a1',
          alert_type: 'unusual_pattern',
          severity: 'medium',
          title: '비정상 쿠폰 발급 패턴',
          description: '카페 ABC에서 1시간 내 100건 이상 발급',
          status: 'new',
          created_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: 'a2',
          alert_type: 'high_volume',
          severity: 'low',
          title: '높은 거래량 감지',
          description: '맛집 XYZ 평소 대비 300% 거래량',
          status: 'acknowledged',
          created_at: new Date(Date.now() - 600000).toISOString(),
        },
      ];
      setAlerts(demoAlerts);

      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // 자동 새로고침 (30초)
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchDashboardData]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'coupon_issued':
        return <Ticket className="w-4 h-4 text-indigo-500" />;
      case 'coupon_used':
        return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'order_created':
        return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'game_won':
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      coupon_issued: '쿠폰 발급',
      coupon_used: '쿠폰 사용',
      order_created: '주문 생성',
      payment_completed: '결제 완료',
      game_won: '게임 승리',
    };
    return labels[type] || type;
  };

  const getHealthColor = (level: string) => {
    switch (level) {
      case 'normal':
        return 'text-emerald-600 bg-emerald-100';
      case 'warning':
        return 'text-amber-600 bg-amber-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}초 전`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    return `${Math.floor(seconds / 86400)}일 전`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Rabbit className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <p className="text-white mt-4">황금토끼 관제센터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* 헤더 */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Rabbit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">황금토끼 관제센터</h1>
              <p className="text-xs text-slate-400">AIRCTT 전체 모니터링</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              ></span>
              <span className="text-sm text-slate-400">
                {autoRefresh ? '실시간' : '일시정지'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="border-slate-600 text-slate-300"
            >
              {autoRefresh ? '일시정지' : '실시간 시작'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="border-slate-600 text-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* KPI 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">총 가맹점</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMerchants}</p>
                </div>
                <Store className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">승인 대기</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {stats.pendingApprovals}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">오늘 거래</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.todayTransactions.toLocaleString()}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">활성 알림</p>
                  <p className="text-2xl font-bold text-red-400">{stats.activeAlerts}</p>
                </div>
                <Bell className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 실시간 거래 스트림 */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                실시간 거래
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {recentEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                  >
                    {getEventIcon(event.event_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {event.metadata?.store_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {getEventLabel(event.event_type)}:{' '}
                        {event.metadata?.coupon_title}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {timeAgo(event.created_at)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* 가맹점 건강도 */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                가맹점 건강도
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 분포 바 */}
              <div className="mb-4">
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-700">
                  <div
                    className="bg-emerald-500"
                    style={{
                      width: `${
                        (stats.healthDistribution.normal / stats.totalMerchants) * 100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-amber-500"
                    style={{
                      width: `${
                        (stats.healthDistribution.warning / stats.totalMerchants) * 100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${
                        (stats.healthDistribution.critical / stats.totalMerchants) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    정상 {stats.healthDistribution.normal}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    주의 {stats.healthDistribution.warning}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    위험 {stats.healthDistribution.critical}
                  </span>
                </div>
              </div>

              {/* 개별 가맹점 */}
              <div className="space-y-2">
                {merchantHealth.map((merchant) => (
                  <div
                    key={merchant.merchant_id}
                    className="flex items-center justify-between p-2 bg-slate-700/30 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          merchant.risk_level === 'normal'
                            ? 'bg-emerald-400'
                            : merchant.risk_level === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`}
                      ></span>
                      <span className="text-sm text-white truncate max-w-32">
                        {merchant.merchant_name}
                      </span>
                    </div>
                    <Badge className={getHealthColor(merchant.risk_level)}>
                      {merchant.overall_score}점
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 이상 감지 알림 */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                이상 감지 알림
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                  <p className="text-slate-400">이상 징후 없음</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {alert.status === 'new' ? '신규' : '확인됨'}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-80">{alert.description}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {timeAgo(alert.created_at)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
