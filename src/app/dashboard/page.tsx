
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Pencil, Trash2, TrendingUp, Store, ChevronRight, 
  Shield, Sparkles, ArrowRight, BarChart3, ShoppingBag, Wallet,
  MapPin, Ticket, Gift, Zap, Radio, Users, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AIBunnyAssistant from '@/components/shared/AIBunnyAssistant';
import { customerService, Customer } from '@/lib/customers';
import { merchantService, Merchant } from '@/lib/merchants';
import { toast } from 'sonner';

function DashboardContent() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
    loadMerchants();
  }, []);

  const loadCustomers = () => {
    const allCustomers = customerService.getAll();
    const sorted = allCustomers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setCustomers(sorted);
  };

  const loadMerchants = () => {
    const allMerchants = merchantService.getAll();
    setMerchants(allMerchants);
  };

  const getMerchantChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const count = merchants.filter(merchant => {
        const merchantDate = new Date(merchant.createdAt).toISOString().split('T')[0];
        return merchantDate === dateStr;
      }).length;

      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count,
      };
    });
  };

  const getRecentMerchants = () => {
    const sorted = [...merchants].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted.slice(0, 5);
  };

  const chartData = getMerchantChartData();
  const recentMerchants = getRecentMerchants();

  const filteredCustomers = searchQuery
    ? customerService.search(searchQuery)
    : customers;

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      customerService.delete(deleteId);
      toast.success('고객이 삭제되었습니다.');
      loadCustomers();
    } catch (error) {
      toast.error('삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            운영중
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
            휴면
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            정지
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const aircttFeatures = [
    {
      title: '소비자 앱',
      description: '위치기반 쿠폰 & AR 피팅',
      icon: ShoppingBag,
      color: 'from-cyan-500 to-blue-500',
      href: '/consumer',
      badge: 'HOT',
      stats: '50K+ 사용자',
    },
    {
      title: '사업자 앱',
      description: '매장 관리 & 광고 시스템',
      icon: Store,
      color: 'from-violet-500 to-purple-500',
      href: '/merchant',
      badge: 'PRO',
      stats: '1.2K+ 매장',
    },
    {
      title: '디지털 지갑',
      description: '포인트 & 결제 시스템',
      icon: Wallet,
      color: 'from-amber-500 to-orange-500',
      href: '/consumer/wallet',
      badge: 'NEW',
      stats: '100K+ 거래',
    },
  ];

  const quickActions = [
    {
      title: 'CRM 관리자',
      description: '연결 및 소식 관리',
      icon: Shield,
      color: 'from-blue-600 to-purple-600',
      href: '/crm/admin',
      badge: 'ADMIN',
    },
    {
      title: '통계 분석',
      description: '실시간 데이터 분석',
      icon: BarChart3,
      color: 'from-green-600 to-teal-600',
      href: '/stats',
      badge: null,
    },
  ];

  const aiFeatures = [
    { icon: MapPin, label: '위치기반 쿠폰', color: 'text-cyan-500' },
    { icon: Ticket, label: 'AR 증강현실', color: 'text-purple-500' },
    { icon: Gift, label: '스마트 추천', color: 'text-pink-500' },
    { icon: Zap, label: '실시간 분석', color: 'text-amber-500' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <Radio className="h-8 w-8 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AIRCTT 통합 대시보드
              </h1>
              <p className="text-muted-foreground">
                위치기반 AR 플랫폼 관리 센터
              </p>
            </div>
          </div>

          {/* AI Features Badge */}
          <div className="flex flex-wrap gap-2 mb-6">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge variant="outline" className="gap-1.5 py-1.5">
                    <Icon className={`w-3.5 h-3.5 ${feature.color}`} />
                    {feature.label}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AIRCTT Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">AIRCTT 플랫폼</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {aircttFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card 
                    className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 overflow-hidden relative"
                    onClick={() => router.push(feature.href)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {feature.badge && (
                          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                            {feature.badge}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{feature.stats}</span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid gap-4 mb-8 md:grid-cols-2"
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} transform group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{action.title}</h3>
                        {action.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                        <span>바로가기</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Analytics Section */}
        <div className="grid gap-6 mb-8 lg:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>가맹점 등록 추이</CardTitle>
                  <CardDescription>최근 7일간 가맹점 등록 현황</CardDescription>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: '등록 수',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>최근 등록 가맹점</CardTitle>
                  <CardDescription>최근 5개 가맹점</CardDescription>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Store className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentMerchants.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">등록된 가맹점이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      onClick={() => router.push(`/merchants/${merchant.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{merchant.name}</p>
                          {getStatusBadge(merchant.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {merchant.businessName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(merchant.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>고객 목록</CardTitle>
                <CardDescription>
                  총 {filteredCustomers.length}명의 고객
                </CardDescription>
              </div>
              <Button onClick={() => router.push('/customers/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                고객 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 고객이 없습니다'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? '다른 검색어로 시도해보세요'
                    : '첫 번째 고객을 등록해보세요'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push('/customers/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    고객 추가
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">썸네일</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>회사</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/customers/${customer.id}`)}
                      >
                        <TableCell>
                          {customer.photoUrl ? (
                            <img
                              src={customer.photoUrl}
                              alt={customer.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.company || '-'}</TableCell>
                        <TableCell>{formatDate(customer.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/customers/${customer.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(customer.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* AI Bunny Assistant */}
      <AIBunnyAssistant userType="admin" />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>고객 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 고객을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
